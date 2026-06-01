from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models import Course, Department, User
from app.schemas import CourseCreate, CourseRead, DepartmentCreate, DepartmentRead

router = APIRouter(tags=["Courses & Departments"])


# ── Departments ───────────────────────────────────────────────────────────────

dept_router = APIRouter(prefix="/departments")


@dept_router.post("", response_model=DepartmentRead, status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    dept = Department(name=payload.name, code=payload.code.upper())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@dept_router.get("", response_model=list[DepartmentRead])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


# ── Courses ───────────────────────────────────────────────────────────────────

course_router = APIRouter(prefix="/courses")


@course_router.post("", response_model=CourseRead, status_code=201)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if db.query(Course).filter(Course.code == payload.code).first():
        raise HTTPException(status_code=409, detail="Course code already exists")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@course_router.get("", response_model=list[CourseRead])
def list_courses(
    semester: int | None = None,
    department_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Course).filter(Course.is_active == True)  # noqa: E712
    if semester:
        q = q.filter(Course.semester == semester)
    if department_id:
        q = q.filter(Course.department_id == department_id)
    return q.all()


@course_router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


router.include_router(dept_router)
router.include_router(course_router)
