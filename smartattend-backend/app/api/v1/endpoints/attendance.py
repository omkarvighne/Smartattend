import base64, io, json, math
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_student, require_teacher
from app.db.session import get_db
from app.models import AttendanceRecord, AttendanceSession, Enrollment, User, VerificationStatus
from app.core.config import settings
from app.core.security import decode_token
from jose import jwt
from app.services.face_service import enroll_student, verify_student
router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _gen_qr_token(session_id: int, teacher_id: int) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(seconds=settings.QR_REFRESH_SECONDS)
    payload = {"session_id": session_id, "teacher_id": teacher_id, "type": "qr_token",
               "iat": now, "exp": exp}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, exp


def _token_to_b64(token: str) -> str:
    try:
        import qrcode
        url = f"{settings.FRONTEND_URL}/attendance/mark?token={token}"
        qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


class SessionCreate(BaseModel):
    course_id: int
    duration_minutes: int = 30


class MarkRequest(BaseModel):
    session_token: str
    face_embedding: list[float]


@router.post("/sessions", status_code=201)
def start_session(payload: SessionCreate, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    now = datetime.now(timezone.utc)
    token, qr_exp = _gen_qr_token(0, teacher.id)
    session = AttendanceSession(
        course_id=payload.course_id, teacher_id=teacher.id,
        session_token=token, qr_expires_at=qr_exp,
        session_expires_at=now + timedelta(minutes=payload.duration_minutes), is_active=True,
    )
    db.add(session)
    db.flush()
    token, qr_exp = _gen_qr_token(session.id, teacher.id)
    session.session_token = token
    session.qr_expires_at = qr_exp
    db.commit()
    return {"session_id": session.id, "qr_token": token, "qr_image_b64": _token_to_b64(token),
            "expires_at": qr_exp, "present_count": 0}


@router.post("/sessions/{session_id}/refresh-qr")
def refresh_qr(session_id: int, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    session = db.get(AttendanceSession, session_id)
    if not session or not session.is_active:
        raise HTTPException(status_code=404, detail="Session not found or closed")
    teacher = current_user.teacher_profile
    token, qr_exp = _gen_qr_token(session.id, teacher.id)
    session.session_token = token
    session.qr_expires_at = qr_exp
    db.commit()
    from sqlalchemy import func
    count = db.query(func.count(AttendanceRecord.id)).filter(AttendanceRecord.session_id == session_id).scalar() or 0
    return {"session_id": session.id, "qr_token": token, "qr_image_b64": _token_to_b64(token),
            "expires_at": qr_exp, "present_count": count}


@router.patch("/sessions/{session_id}/close")
def close_session(session_id: int, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    db.commit()
    return {"id": session.id, "is_active": False}


@router.post("/mark")
def mark_attendance(payload: MarkRequest, current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    # Validate QR token
    try:
        data = jwt.decode(payload.session_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if data.get("type") != "qr_token":
            raise ValueError
        session_id = data["session_id"]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired QR code. Please scan the latest QR.")

    session = db.get(AttendanceSession, session_id)
    if not session or not session.is_active:
        raise HTTPException(status_code=400, detail="Session is closed or doesn't exist")

    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check duplicate
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student.id,
        AttendanceRecord.session_id == session_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Attendance already marked for this session")

    # Check enrollment
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.course_id == session.course_id,
    ).first()
    if not enrolled:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    # Face verification (cosine similarity — stub passes if no embedding stored)
    similarity = 1.0
    verified = True
    if student.face_embedding:
        stored = json.loads(student.face_embedding.embedding_json)
        live = payload.face_embedding
        if len(stored) == len(live):
            dot = sum(a * b for a, b in zip(stored, live))
            mag_a = math.sqrt(sum(a ** 2 for a in stored))
            mag_b = math.sqrt(sum(b ** 2 for b in live))
            similarity = dot / (mag_a * mag_b) if mag_a and mag_b else 0.0
            verified = similarity >= 0.60

    record = AttendanceRecord(
        student_id=student.id, session_id=session_id, course_id=session.course_id,
        verification_status=VerificationStatus.VERIFIED if verified else VerificationStatus.FAILED,
        similarity_score=round(similarity, 4),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    if not verified:
        return {"success": False, "message": f"Face verification failed (score: {similarity:.2f}). Try better lighting."}
    return {"success": True, "message": "✅ Attendance marked successfully!", "record": {
        "id": record.id, "marked_at": record.marked_at, "verification_status": record.verification_status
    }}


@router.get("/my-summary")
def my_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=403, detail="Only students can view attendance summary")
    return {"student_id": student.id, "overall_percentage": 76.4, "is_defaulter": False, "course_stats": []}


@router.get("/courses/{course_id}/defaulters")
def defaulters(course_id: int, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    return []
# ── FACE ENROLL ──────────────────────────────────────────────────────────────
@router.post("/face/enroll")
async def enroll_face(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    image_bytes = await file.read()
    try:
        enroll_student(str(student.id), image_bytes)
        return {"message": f"Face enrolled successfully for student {student.id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Enrollment failed: {str(e)}")


# ── FACE VERIFY ──────────────────────────────────────────────────────────────
@router.post("/face/verify")
async def verify_face(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    image_bytes = await file.read()
    try:
        result = verify_student(str(student.id), image_bytes)
        if not result["matched"]:
            raise HTTPException(status_code=401, detail=result["reason"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification error: {str(e)}")


# ── FACE VERIFY + MARK ATTENDANCE (combined) ─────────────────────────────────
@router.post("/face/verify-and-mark")
async def verify_and_mark(
    session_token: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Step 1 — validate QR token
    try:
        data = jwt.decode(session_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if data.get("type") != "qr_token":
            raise ValueError
        session_id = data["session_id"]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired QR code")

    session = db.get(AttendanceSession, session_id)
    if not session or not session.is_active:
        raise HTTPException(status_code=400, detail="Session is closed or doesn't exist")

    # Step 2 — duplicate check
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student.id,
        AttendanceRecord.session_id == session_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Attendance already marked for this session")

    # Step 3 — enrollment check
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.course_id == session.course_id,
    ).first()
    if not enrolled:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    # Step 4 — real face verification via DeepFace
    image_bytes = await file.read()
    try:
        result = verify_student(str(student.id), image_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face verification error: {str(e)}")

    verified = result["matched"]
    similarity = result["score"]  # keep raw L2 distance score

    # Step 5 — mark attendance regardless (failed = FAILED status, not blocked)
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
        raise HTTPException(
            status_code=401,
            detail=f"Face verification failed. Reason: {result['reason']}"
        )

    return {
        "success": True,
        "message": "✅ Attendance marked successfully!",
        "face_score": result["score"],
        "record": {
            "id": record.id,
            "marked_at": record.marked_at,
            "verification_status": record.verification_status,
        }
    }