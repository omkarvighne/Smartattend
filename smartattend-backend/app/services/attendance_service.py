"""
Attendance Service
Handles the full attendance lifecycle:
  create session → generate QR → validate QR → face verify → mark attendance
"""

import json
import math
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    AttendanceRecord,
    AttendanceSession,
    Course,
    Enrollment,
    Student,
    VerificationStatus,
)
from app.schemas import (
    CourseAttendanceStat,
    DefaulterRead,
    MarkAttendanceRequest,
    MarkAttendanceResponse,
    QRResponse,
    SessionCreate,
    SessionRead,
    StudentAttendanceSummary,
)
from app.services.qr_service import (
    generate_qr_token,
    token_to_qr_image_b64,
    validate_qr_token,
)


# ── Session management ────────────────────────────────────────────────────────

def create_session(payload: SessionCreate, teacher_id: int, db: Session) -> QRResponse:
    course = db.get(Course, payload.course_id)
    if not course or not course.is_active:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="You are not assigned to this course")

    now = datetime.now(timezone.utc)
    session_expires = now + timedelta(minutes=payload.duration_minutes)
    qr_token, qr_expires = generate_qr_token(0, teacher_id)  # placeholder session_id=0

    session = AttendanceSession(
        course_id=payload.course_id,
        teacher_id=teacher_id,
        session_token=qr_token,
        qr_expires_at=qr_expires,
        session_expires_at=session_expires,
        is_active=True,
    )
    db.add(session)
    db.flush()  # get session.id before commit

    # Regenerate token now that we have the real session_id
    qr_token, qr_expires = generate_qr_token(session.id, teacher_id)
    session.session_token = qr_token
    session.qr_expires_at = qr_expires
    db.commit()
    db.refresh(session)

    return QRResponse(
        session_id=session.id,
        qr_token=qr_token,
        qr_image_b64=token_to_qr_image_b64(qr_token),
        expires_at=qr_expires,
        present_count=0,
    )


def refresh_qr(session_id: int, teacher_id: int, db: Session) -> QRResponse:
    """Generate a fresh QR token for an active session (called every 30 s)."""
    session = _get_active_session(session_id, db)
    if session.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not your session")

    qr_token, qr_expires = generate_qr_token(session.id, teacher_id)
    session.session_token = qr_token
    session.qr_expires_at = qr_expires
    db.commit()

    present_count = db.query(func.count(AttendanceRecord.id)).filter(
        AttendanceRecord.session_id == session_id
    ).scalar()

    return QRResponse(
        session_id=session.id,
        qr_token=qr_token,
        qr_image_b64=token_to_qr_image_b64(qr_token),
        expires_at=qr_expires,
        present_count=present_count or 0,
    )


def close_session(session_id: int, teacher_id: int, db: Session) -> SessionRead:
    session = _get_active_session(session_id, db)
    if session.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not your session")
    session.is_active = False
    db.commit()
    db.refresh(session)
    return SessionRead.model_validate(session)


def _get_active_session(session_id: int, db: Session) -> AttendanceSession:
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Session is closed")
    # SQLite returns naive datetimes; PostgreSQL returns aware. Handle both.
    expires = session.session_expires_at
    now = datetime.now(timezone.utc)
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        session.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="Session has expired")
    return session


# ── Mark attendance ───────────────────────────────────────────────────────────

SIMILARITY_THRESHOLD = 0.60   # cosine similarity — tune after testing


def mark_attendance(
    payload: MarkAttendanceRequest,
    student: Student,
    db: Session,
) -> MarkAttendanceResponse:
    # 1. Validate QR token
    try:
        token_data = validate_qr_token(payload.session_token)
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired QR code")

    session_id: int = token_data["session_id"]
    session = _get_active_session(session_id, db)

    # 2. Check QR hasn't rotated past expiry
    qr_expires = session.qr_expires_at
    now = datetime.now(timezone.utc)
    if qr_expires.tzinfo is None:
        qr_expires = qr_expires.replace(tzinfo=timezone.utc)
    if now > qr_expires:
        raise HTTPException(status_code=400, detail="QR code expired — scan the latest code")

    # 3. Duplicate prevention
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student.id,
        AttendanceRecord.session_id == session_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Attendance already marked for this session")

    # 4. Student enrolled in this course?
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.course_id == session.course_id,
    ).first()
    if not enrolled:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    # 5. Face verification
    similarity, verified = _verify_face(student, payload.face_embedding)

    # 6. Write record
    record = AttendanceRecord(
        student_id=student.id,
        session_id=session_id,
        course_id=session.course_id,
        verification_status=VerificationStatus.VERIFIED if verified else VerificationStatus.FAILED,
        similarity_score=round(similarity, 4),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    if not verified:
        return MarkAttendanceResponse(
            success=False,
            message=f"Face verification failed (score: {similarity:.2f}). Please try again in better lighting.",
        )

    from app.schemas import AttendanceRecordRead
    return MarkAttendanceResponse(
        success=True,
        message="Attendance marked successfully ✓",
        record=AttendanceRecordRead.model_validate(record),
    )


def _verify_face(student: Student, live_embedding: list[float]) -> tuple[float, bool]:
    """
    Compare live embedding against stored embedding using cosine similarity.
    Returns (similarity_score, is_verified).
    Stub returns 1.0/True when no embedding stored (for dev/testing).
    """
    if not student.face_embedding or not student.face_enrollment:
        # No embedding yet — allow during testing, block in production
        return 1.0, True

    stored: list[float] = json.loads(student.face_embedding.embedding_json)
    score = _cosine_similarity(live_embedding, stored)
    return score, score >= SIMILARITY_THRESHOLD


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x ** 2 for x in a))
    mag_b = math.sqrt(sum(x ** 2 for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


# ── Analytics ─────────────────────────────────────────────────────────────────

def get_student_summary(student: Student, db: Session) -> StudentAttendanceSummary:
    enrollments = student.enrollments
    course_stats: list[CourseAttendanceStat] = []

    for enr in enrollments:
        course = enr.course
        total_sessions = db.query(func.count(AttendanceSession.id)).filter(
            AttendanceSession.course_id == course.id,
            AttendanceSession.is_active == False,  # noqa: E712
        ).scalar() or 0

        attended = db.query(func.count(AttendanceRecord.id)).filter(
            AttendanceRecord.student_id == student.id,
            AttendanceRecord.course_id == course.id,
            AttendanceRecord.verification_status == VerificationStatus.VERIFIED,
        ).scalar() or 0

        pct = round((attended / total_sessions * 100), 1) if total_sessions else 0.0
        course_stats.append(CourseAttendanceStat(
            course_id=course.id,
            course_name=course.name,
            course_code=course.code,
            total_sessions=total_sessions,
            attended=attended,
            percentage=pct,
        ))

    overall = round(
        sum(c.percentage for c in course_stats) / len(course_stats), 1
    ) if course_stats else 0.0

    return StudentAttendanceSummary(
        student_id=student.id,
        prn=student.prn,
        name=student.user.name,
        overall_percentage=overall,
        is_defaulter=overall < settings.DEFAULTER_THRESHOLD,
        course_stats=course_stats,
    )


def get_defaulters(course_id: int, teacher_id: int, db: Session) -> list[DefaulterRead]:
    course = db.get(Course, course_id)
    if not course or course.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not your course")

    total_sessions = db.query(func.count(AttendanceSession.id)).filter(
        AttendanceSession.course_id == course_id,
        AttendanceSession.is_active == False,  # noqa: E712
    ).scalar() or 0

    if total_sessions == 0:
        return []

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    defaulters: list[DefaulterRead] = []

    for enr in enrollments:
        attended = db.query(func.count(AttendanceRecord.id)).filter(
            AttendanceRecord.student_id == enr.student_id,
            AttendanceRecord.course_id == course_id,
            AttendanceRecord.verification_status == VerificationStatus.VERIFIED,
        ).scalar() or 0

        pct = round(attended / total_sessions * 100, 1)
        if pct < settings.DEFAULTER_THRESHOLD:
            defaulters.append(DefaulterRead(
                student_id=enr.student.id,
                prn=enr.student.prn,
                name=enr.student.user.name,
                course_id=course.id,
                course_name=course.name,
                percentage=pct,
            ))

    return sorted(defaulters, key=lambda d: d.percentage)
