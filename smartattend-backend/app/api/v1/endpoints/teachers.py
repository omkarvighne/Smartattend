from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin, require_teacher
from app.core.security import hash_password
from app.db.session import get_db
from app.models import Teacher, User, UserRole
from app.schemas import TeacherCreate, TeacherRead

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.post("", response_model=TeacherRead, status_code=201)
def register_teacher(
    payload: TeacherCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if db.query(Teacher).filter(Teacher.employee_id == payload.employee_id).first():
        raise HTTPException(status_code=409, detail="Employee ID already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.TEACHER,
    )
    db.add(user)
    db.flush()

    teacher = Teacher(
        user_id=user.id,
        employee_id=payload.employee_id,
        department_id=payload.department_id,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("", response_model=list[TeacherRead])
def list_teachers(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return db.query(Teacher).all()


@router.get("/me/courses")
def my_courses(
    current_teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    teacher = current_teacher.teacher_profile
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    from app.schemas import CourseRead
    return [CourseRead.model_validate(c) for c in teacher.courses]
