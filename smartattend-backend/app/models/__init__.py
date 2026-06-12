from __future__ import annotations
import enum
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    student_profile: Mapped[Student | None] = relationship("Student", back_populates="user", uselist=False)
    teacher_profile: Mapped[Teacher | None] = relationship("Teacher", back_populates="user", uselist=False)


class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    students: Mapped[list[Student]] = relationship("Student", back_populates="department")
    courses: Mapped[list[Course]] = relationship("Course", back_populates="department")


class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    prn: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    face_enrolled: Mapped[bool] = mapped_column(Boolean, default=False)
    user: Mapped[User] = relationship("User", back_populates="student_profile")
    department: Mapped[Department] = relationship("Department", back_populates="students")
    face_embedding: Mapped[FaceEmbedding | None] = relationship("FaceEmbedding", back_populates="student", uselist=False)
    attendance_records: Mapped[list[AttendanceRecord]] = relationship("AttendanceRecord", back_populates="student")
    enrollments: Mapped[list[Enrollment]] = relationship("Enrollment", back_populates="student")


class Teacher(Base):
    __tablename__ = "teachers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    employee_id: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    user: Mapped[User] = relationship("User", back_populates="teacher_profile")
    courses: Mapped[list[Course]] = relationship("Course", back_populates="teacher")
    sessions: Mapped[list[AttendanceSession]] = relationship("AttendanceSession", back_populates="teacher")


class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    teacher: Mapped[Teacher] = relationship("Teacher", back_populates="courses")
    department: Mapped[Department] = relationship("Department", back_populates="courses")
    sessions: Mapped[list[AttendanceSession]] = relationship("AttendanceSession", back_populates="course")
    enrollments: Mapped[list[Enrollment]] = relationship("Enrollment", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "course_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    student: Mapped[Student] = relationship("Student", back_populates="enrollments")
    course: Mapped[Course] = relationship("Course", back_populates="enrollments")


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=False)
    session_token: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    qr_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    session_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    course: Mapped[Course] = relationship("Course", back_populates="sessions")
    teacher: Mapped[Teacher] = relationship("Teacher", back_populates="sessions")
    records: Mapped[list[AttendanceRecord]] = relationship("AttendanceRecord", back_populates="session")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("student_id", "session_id", name="uq_student_session"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    session_id: Mapped[int] = mapped_column(ForeignKey("attendance_sessions.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    similarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    student: Mapped[Student] = relationship("Student", back_populates="attendance_records")
    session: Mapped[AttendanceSession] = relationship("AttendanceSession", back_populates="records")


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), unique=True, nullable=False)
    embedding_json: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str] = mapped_column(String(50), default="DeepFace-ArcFace")
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    student: Mapped[Student] = relationship("Student", back_populates="face_embedding")
