"""
Seed script — populates the database with demo data.
Run: python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.security import hash_password
from app.db.session import SessionLocal, Base, engine
from app.models import (
    Department, User, UserRole,
    Student, Teacher, Course, Enrollment,
)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(User).first():
            print("⚠️  Database already has data. Skipping seed.")
            return

        print("🌱  Seeding database...")

        # --- Departments ---
        cse = Department(name="Computer Science & Engineering", code="CSE")
        it  = Department(name="Information Technology", code="IT")
        db.add_all([cse, it])
        db.flush()

        # --- Admin user ---
        admin_user = User(
            name="Admin Account",
            email="admin@smartattend.ai",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
        )
        db.add(admin_user)
        db.flush()

        # --- Teacher ---
        teacher_user = User(
            name="Prof. R. Patil",
            email="rpatil@jspm.edu.in",
            hashed_password=hash_password("teacher123"),
            role=UserRole.TEACHER,
        )
        db.add(teacher_user)
        db.flush()

        teacher = Teacher(
            user_id=teacher_user.id,
            employee_id="EMP001",
            department_id=cse.id,
        )
        db.add(teacher)
        db.flush()

        # --- Courses ---
        dsa = Course(name="Data Structures & Algorithms", code="CSE301",
                     teacher_id=teacher.id, department_id=cse.id, semester=3)
        os_  = Course(name="Operating Systems", code="CSE302",
                     teacher_id=teacher.id, department_id=cse.id, semester=3)
        dbms = Course(name="Database Management Systems", code="CSE303",
                     teacher_id=teacher.id, department_id=cse.id, semester=4)
        db.add_all([dsa, os_, dbms])
        db.flush()

        # --- Students ---
        students_data = [
            ("Omkar Shinde",  "omkar@jspm.edu.in",   "202412345", 3),
            ("Aryan Mehta",   "aryan@jspm.edu.in",   "202412346", 3),
            ("Priya Joshi",   "priya@jspm.edu.in",   "202412347", 3),
            ("Ravi Kumar",    "ravi@jspm.edu.in",    "202412348", 3),
            ("Sneha Patil",   "sneha@jspm.edu.in",   "202412349", 3),
        ]

        for name, email, prn, sem in students_data:
            u = User(
                name=name,
                email=email,
                hashed_password=hash_password("student123"),
                role=UserRole.STUDENT,
            )
            db.add(u)
            db.flush()

            s = Student(user_id=u.id, prn=prn, department_id=cse.id, semester=sem)
            db.add(s)
            db.flush()

            # Enroll in all 3 courses
            for course in [dsa, os_, dbms]:
                db.add(Enrollment(student_id=s.id, course_id=course.id))

        db.commit()
        print("✅  Seed complete!")
        print()
        print("  Login credentials:")
        print("  Admin   → admin@smartattend.ai    / admin123")
        print("  Teacher → rpatil@jspm.edu.in      / teacher123")
        print("  Student → omkar@jspm.edu.in       / student123")

    except Exception as e:
        db.rollback()
        print(f"❌  Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
