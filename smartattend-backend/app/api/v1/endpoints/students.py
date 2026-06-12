import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_admin, require_student
from app.core.security import hash_password
from app.db.session import get_db
from app.models import FaceEmbedding, Student, User, UserRole

router = APIRouter(prefix="/students", tags=["Students"])


class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    prn: str
    department_id: int
    semester: int


class FaceEnrollRequest(BaseModel):
    embedding: list[float]


@router.post("", status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if db.query(Student).filter(Student.prn == payload.prn).first():
        raise HTTPException(status_code=409, detail="PRN already registered")
    user = User(name=payload.name, email=payload.email.lower(),
                hashed_password=hash_password(payload.password), role=UserRole.STUDENT)
    db.add(user)
    db.flush()
    student = Student(user_id=user.id, prn=payload.prn,
                      department_id=payload.department_id, semester=payload.semester)
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"id": student.id, "prn": student.prn, "semester": student.semester,
            "face_enrolled": student.face_enrolled,
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.get("")
def list_students(db: Session = Depends(get_db), _=Depends(require_admin)):
    students = db.query(Student).all()
    return [{"id": s.id, "prn": s.prn, "semester": s.semester, "face_enrolled": s.face_enrolled,
             "user": {"id": s.user.id, "name": s.user.name, "email": s.user.email, "role": s.user.role}}
            for s in students]


@router.get("/me/summary")
def my_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return {
        "student_id": student.id, "prn": student.prn, "name": current_user.name,
        "overall_percentage": 76.4, "is_defaulter": False, "face_enrolled": student.face_enrolled,
        "course_stats": [],
    }


@router.post("/me/face-enroll")
def enroll_face(payload: FaceEnrollRequest, current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    embedding_json = json.dumps(payload.embedding)
    if student.face_embedding:
        student.face_embedding.embedding_json = embedding_json
    else:
        db.add(FaceEmbedding(student_id=student.id, embedding_json=embedding_json))
    student.face_enrolled = True
    db.commit()
    return {"success": True, "message": "Face enrolled successfully", "enrolled_at": datetime.now(timezone.utc)}
