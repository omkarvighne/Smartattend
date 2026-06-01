from fastapi import APIRouter

from app.api.v1.endpoints.attendance import router as attendance_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.courses import router as courses_router
from app.api.v1.endpoints.students import router as students_router
from app.api.v1.endpoints.teachers import router as teachers_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(students_router)
api_router.include_router(teachers_router)
api_router.include_router(attendance_router)
api_router.include_router(courses_router)
