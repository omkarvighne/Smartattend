"""
Pydantic schemas — request bodies and response shapes.
Named as: <Model>Create (input), <Model>Read (output), <Model>Update (partial update).
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Student ───────────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    prn: str = Field(..., min_length=5, max_length=20)
    department_id: int
    semester: int = Field(..., ge=1, le=8)


class StudentRead(BaseModel):
    id: int
    prn: str
    semester: int
    face_enrolled: bool
    user: UserRead

    model_config = {"from_attributes": True}


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[int] = Field(None, ge=1, le=8)


# ── Teacher ───────────────────────────────────────────────────────────────────

class TeacherCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    employee_id: str = Field(..., min_length=3, max_length=20)
    department_id: Optional[int] = None


class TeacherRead(BaseModel):
    id: int
    employee_id: str
    user: UserRead

    model_config = {"from_attributes": True}


# ── Department ────────────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    code: str = Field(..., max_length=10)


class DepartmentRead(BaseModel):
    id: int
    name: str
    code: str

    model_config = {"from_attributes": True}


# ── Course ────────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    name: str
    code: str = Field(..., max_length=20)
    teacher_id: int
    department_id: int
    semester: int = Field(..., ge=1, le=8)


class CourseRead(BaseModel):
    id: int
    name: str
    code: str
    semester: int
    is_active: bool
    teacher: TeacherRead

    model_config = {"from_attributes": True}


# ── Attendance Session ────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    course_id: int
    duration_minutes: int = Field(default=30, ge=5, le=180)


class SessionRead(BaseModel):
    id: int
    course_id: int
    is_active: bool
    qr_expires_at: datetime
    session_expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class QRResponse(BaseModel):
    session_id: int
    qr_token: str           # encrypted token embedded in QR
    qr_image_b64: str       # base64 PNG for frontend display
    expires_at: datetime
    present_count: int


# ── Attendance Record ─────────────────────────────────────────────────────────

class MarkAttendanceRequest(BaseModel):
    session_token: str       # scanned from QR
    face_embedding: list[float]  # sent from client after local face capture


class AttendanceRecordRead(BaseModel):
    id: int
    student_id: int
    session_id: int
    course_id: int
    marked_at: datetime
    verification_status: str
    similarity_score: Optional[float]

    model_config = {"from_attributes": True}


class MarkAttendanceResponse(BaseModel):
    success: bool
    message: str
    record: Optional[AttendanceRecordRead] = None


# ── Analytics ─────────────────────────────────────────────────────────────────

class CourseAttendanceStat(BaseModel):
    course_id: int
    course_name: str
    course_code: str
    total_sessions: int
    attended: int
    percentage: float


class StudentAttendanceSummary(BaseModel):
    student_id: int
    prn: str
    name: str
    overall_percentage: float
    is_defaulter: bool
    course_stats: list[CourseAttendanceStat]


class DefaulterRead(BaseModel):
    student_id: int
    prn: str
    name: str
    course_id: int
    course_name: str
    percentage: float


# ── Face Enrollment ───────────────────────────────────────────────────────────

class FaceEnrollRequest(BaseModel):
    embedding: list[float] = Field(..., min_length=128)

    @field_validator("embedding")
    @classmethod
    def must_be_floats(cls, v: list) -> list[float]:
        return [float(x) for x in v]


class FaceEnrollResponse(BaseModel):
    success: bool
    message: str
    enrolled_at: Optional[datetime] = None
