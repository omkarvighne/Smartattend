import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin, require_student
from app.core.security import hash_password
from app.db.session import get_db
from app.models import FaceEmbedding, Student, User, UserRole
from app.schemas import (
    FaceEnrollRequest,
    FaceEnrollResponse,
    StudentAttendanceSummary,
    StudentCreate,
    StudentRead,
)
from app.services.attendance_service import get_student_summary

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("", response_model=StudentRead, status_code=201)
def register_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin creates a student account."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if db.query(Student).filter(Student.prn == payload.prn).first():
        raise HTTPException(status_code=409, detail="PRN already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        prn=payload.prn,
        department_id=payload.department_id,
        semester=payload.semester,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("", response_model=list[StudentRead])
def list_students(
    semester: int | None = None,
    department_id: int | None = None,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    q = db.query(Student)
    if semester:
        q = q.filter(Student.semester == semester)
    if department_id:
        q = q.filter(Student.department_id == department_id)
    return q.all()


@router.get("/me/summary", response_model=StudentAttendanceSummary)
def my_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Student fetches their own attendance summary."""
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return get_student_summary(student, db)


@router.post("/me/face-enroll", response_model=FaceEnrollResponse)
def enroll_face(
    payload: FaceEnrollRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student uploads face embedding for the first time (or re-enrols)."""
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    embedding_json = json.dumps(payload.embedding)

    if student.face_embedding:
        student.face_embedding.embedding_json = embedding_json
    else:
        fe = FaceEmbedding(student_id=student.id, embedding_json=embedding_json)
        db.add(fe)

    student.face_enrolled = True
    db.commit()

    from datetime import datetime, timezone
    return FaceEnrollResponse(
        success=True,
        message="Face enrolled successfully",
        enrolled_at=datetime.now(timezone.utc),
    )
