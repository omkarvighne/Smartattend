from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_admin, require_teacher
from app.core.security import hash_password
from app.db.session import get_db
from app.models import Course, Department, Teacher, User, UserRole

router = APIRouter(prefix="/teachers", tags=["Teachers"])


class TeacherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    employee_id: str
    department_id: int | None = None


@router.post("", status_code=201)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name, email=payload.email.lower(),
                hashed_password=hash_password(payload.password), role=UserRole.TEACHER)
    db.add(user)
    db.flush()
    teacher = Teacher(user_id=user.id, employee_id=payload.employee_id, department_id=payload.department_id)
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return {"id": teacher.id, "employee_id": teacher.employee_id,
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.get("")
def list_teachers(db: Session = Depends(get_db), _=Depends(require_admin)):
    return [{"id": t.id, "employee_id": t.employee_id,
             "user": {"id": t.user.id, "name": t.user.name, "email": t.user.email, "role": t.user.role}}
            for t in db.query(Teacher).all()]


@router.get("/me/courses")
def my_courses(current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    teacher = current_user.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return [{"id": c.id, "name": c.name, "code": c.code, "semester": c.semester,
             "is_active": c.is_active} for c in teacher.courses]
