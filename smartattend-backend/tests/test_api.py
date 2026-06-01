"""
Tests for SmartAttend AI backend.
Uses an in-memory SQLite database — no PostgreSQL needed for testing.
Run: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app

# ── Test DB (SQLite in-memory) ─────────────────────────────────────────────────

TEST_DB_URL = "sqlite:///./test.db"

engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine_test, autocommit=False, autoflush=False)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ── Helpers ────────────────────────────────────────────────────────────────────

def seed_base(client: TestClient):
    """Seed minimum data needed for tests via API calls."""
    # Create admin directly in DB for bootstrapping
    from app.core.security import hash_password
    from app.models import User, UserRole, Department, Teacher, Student, Course, Enrollment

    db = TestingSession()
    dept = Department(name="CSE", code="CSE")
    db.add(dept)
    db.flush()

    admin_user = User(name="Admin", email="admin@test.com",
                      hashed_password=hash_password("admin123"), role=UserRole.ADMIN)
    db.add(admin_user)

    teacher_user = User(name="Prof Test", email="teacher@test.com",
                        hashed_password=hash_password("teacher123"), role=UserRole.TEACHER)
    db.add(teacher_user)
    db.flush()

    teacher = Teacher(user_id=teacher_user.id, employee_id="T001", department_id=dept.id)
    db.add(teacher)
    db.flush()

    course = Course(name="DSA", code="DSA101", teacher_id=teacher.id,
                    department_id=dept.id, semester=3)
    db.add(course)
    db.flush()

    student_user = User(name="Omkar", email="student@test.com",
                        hashed_password=hash_password("student123"), role=UserRole.STUDENT)
    db.add(student_user)
    db.flush()

    student = Student(user_id=student_user.id, prn="PRN001",
                      department_id=dept.id, semester=3)
    db.add(student)
    db.flush()

    db.add(Enrollment(student_id=student.id, course_id=course.id))
    db.commit()
    db.close()

    return {"teacher_user": teacher_user, "student": student, "course": course}


# ── Tests ──────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_root(self, client):
        r = client.get("/")
        assert r.status_code == 200
        assert r.json()["status"] == "running"

    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


class TestAuth:
    def test_login_invalid(self, client):
        r = client.post("/api/v1/auth/login", json={
            "email": "nobody@test.com", "password": "wrong"
        })
        assert r.status_code == 401

    def test_login_success(self, client):
        seed_base(client)
        r = client.post("/api/v1/auth/login", json={
            "email": "teacher@test.com", "password": "teacher123"
        })
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_me_without_token(self, client):
        r = client.get("/api/v1/auth/me")
        assert r.status_code in (401, 403)  # no bearer header

    def test_me_with_token(self, client):
        r = client.post("/api/v1/auth/login", json={
            "email": "teacher@test.com", "password": "teacher123"
        })
        token = r.json()["access_token"]
        r2 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        assert r2.json()["email"] == "teacher@test.com"

    def test_refresh_token(self, client):
        r = client.post("/api/v1/auth/login", json={
            "email": "student@test.com", "password": "student123"
        })
        refresh_token = r.json()["refresh_token"]
        r2 = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert r2.status_code == 200
        assert "access_token" in r2.json()


class TestAttendanceSession:
    def _teacher_token(self, client):
        r = client.post("/api/v1/auth/login", json={
            "email": "teacher@test.com", "password": "teacher123"
        })
        return r.json()["access_token"]

    def _student_token(self, client):
        r = client.post("/api/v1/auth/login", json={
            "email": "student@test.com", "password": "student123"
        })
        return r.json()["access_token"]

    def test_create_session(self, client):
        token = self._teacher_token(client)
        r = client.post("/api/v1/attendance/sessions",
                        json={"course_id": 1, "duration_minutes": 30},
                        headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 201
        data = r.json()
        assert "qr_token" in data
        assert "qr_image_b64" in data
        assert data["session_id"] >= 1

    def test_student_cannot_create_session(self, client):
        token = self._student_token(client)
        r = client.post("/api/v1/attendance/sessions",
                        json={"course_id": 1, "duration_minutes": 30},
                        headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 403

    def test_mark_attendance(self, client):
        teacher_token = self._teacher_token(client)
        r = client.post("/api/v1/attendance/sessions",
                        json={"course_id": 1, "duration_minutes": 30},
                        headers={"Authorization": f"Bearer {teacher_token}"})
        qr_token = r.json()["qr_token"]

        student_token = self._student_token(client)
        dummy_embedding = [0.1] * 512  # stub embedding
        r2 = client.post("/api/v1/attendance/mark",
                         json={"session_token": qr_token, "face_embedding": dummy_embedding},
                         headers={"Authorization": f"Bearer {student_token}"})
        assert r2.status_code == 200
        assert r2.json()["success"] is True

    def test_duplicate_attendance_prevented(self, client):
        teacher_token = self._teacher_token(client)
        r = client.post("/api/v1/attendance/sessions",
                        json={"course_id": 1, "duration_minutes": 30},
                        headers={"Authorization": f"Bearer {teacher_token}"})
        qr_token = r.json()["qr_token"]

        student_token = self._student_token(client)
        dummy_embedding = [0.1] * 512
        # First mark
        client.post("/api/v1/attendance/mark",
                    json={"session_token": qr_token, "face_embedding": dummy_embedding},
                    headers={"Authorization": f"Bearer {student_token}"})
        # Second mark — should be rejected
        r2 = client.post("/api/v1/attendance/mark",
                         json={"session_token": qr_token, "face_embedding": dummy_embedding},
                         headers={"Authorization": f"Bearer {student_token}"})
        assert r2.status_code == 409
