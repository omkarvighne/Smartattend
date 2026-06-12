from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models import Course, Department

router = APIRouter(tags=["Courses & Departments"])

dept_router = APIRouter(prefix="/departments")
course_router = APIRouter(prefix="/courses")


class DeptCreate(BaseModel):
    name: str
    code: str


class CourseCreate(BaseModel):
    name: str
    code: str
    teacher_id: int
    department_id: int
    semester: int


@dept_router.post("", status_code=201)
def create_dept(payload: DeptCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    dept = Department(name=payload.name, code=payload.code.upper())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"id": dept.id, "name": dept.name, "code": dept.code}


@dept_router.get("")
def list_depts(db: Session = Depends(get_db)):
    return [{"id": d.id, "name": d.name, "code": d.code} for d in db.query(Department).all()]


@course_router.post("", status_code=201)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Course).filter(Course.code == payload.code).first():
        raise HTTPException(status_code=409, detail="Course code already exists")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "name": course.name, "code": course.code, "semester": course.semester}


@course_router.get("")
def list_courses(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name, "code": c.code, "semester": c.semester,
             "is_active": c.is_active} for c in db.query(Course).filter(Course.is_active == True).all()]


router.include_router(dept_router)
router.include_router(course_router)
