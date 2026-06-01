from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_student, require_teacher
from app.db.session import get_db
from app.models import User
from app.schemas import (
    DefaulterRead,
    MarkAttendanceRequest,
    MarkAttendanceResponse,
    QRResponse,
    SessionCreate,
    SessionRead,
    StudentAttendanceSummary,
)
from app.services.attendance_service import (
    close_session,
    create_session,
    get_defaulters,
    get_student_summary,
    mark_attendance,
    refresh_qr,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ── Teacher: session management ───────────────────────────────────────────────

@router.post("/sessions", response_model=QRResponse, status_code=201)
def start_session(
    payload: SessionCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Teacher starts an attendance session and gets a QR code."""
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return create_session(payload, teacher.id, db)


@router.post("/sessions/{session_id}/refresh-qr", response_model=QRResponse)
def refresh_session_qr(
    session_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Called every 30 s by the teacher dashboard to rotate the QR code."""
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return refresh_qr(session_id, teacher.id, db)


@router.patch("/sessions/{session_id}/close", response_model=SessionRead)
def end_session(
    session_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Teacher manually closes a session."""
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return close_session(session_id, teacher.id, db)


# ── Student: mark attendance ──────────────────────────────────────────────────

@router.post("/mark", response_model=MarkAttendanceResponse)
def mark(
    payload: MarkAttendanceRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Student scans QR → client captures face → sends token + embedding here.
    Server validates QR token and compares face embedding.
    """
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return mark_attendance(payload, student, db)


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/my-summary", response_model=StudentAttendanceSummary)
def my_attendance_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=403, detail="Only students can view attendance summary")
    return get_student_summary(student, db)


@router.get("/courses/{course_id}/defaulters", response_model=list[DefaulterRead])
def course_defaulters(
    course_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Teacher fetches defaulter list for a specific course."""
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return get_defaulters(course_id, teacher.id, db)
