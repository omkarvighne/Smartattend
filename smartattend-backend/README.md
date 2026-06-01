# SmartAttend AI — Backend

FastAPI backend for the SmartAttend AI attendance management platform.

## Stack
- **FastAPI** — async API framework
- **PostgreSQL** — primary database (SQLite for testing)
- **SQLAlchemy 2** — ORM with typed mapped columns
- **JWT** — access + refresh token auth
- **bcrypt** — password hashing
- **DeepFace / FAISS** — AI face verification (Phase 2)

## Project structure

```
smartattend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, lifespan
│   ├── api/v1/
│   │   ├── __init__.py          # Router aggregator
│   │   └── endpoints/
│   │       ├── auth.py          # Login, refresh, /me
│   │       ├── students.py      # Register, list, face enroll
│   │       ├── teachers.py      # Register, list, my courses
│   │       ├── attendance.py    # Sessions, QR, mark, defaulters
│   │       └── courses.py       # Courses & departments
│   ├── core/
│   │   ├── config.py            # Pydantic settings (reads .env)
│   │   ├── security.py          # JWT + bcrypt helpers
│   │   └── dependencies.py      # Auth guards (require_teacher etc.)
│   ├── db/
│   │   └── session.py           # Engine, SessionLocal, get_db
│   ├── models/
│   │   └── __init__.py          # All SQLAlchemy models
│   ├── schemas/
│   │   └── __init__.py          # All Pydantic request/response schemas
│   └── services/
│       ├── auth_service.py      # Login / refresh logic
│       ├── attendance_service.py # Session + mark + analytics
│       └── qr_service.py        # QR token generation + image
├── tests/
│   └── test_api.py              # 11 tests (pytest + SQLite)
├── seed.py                      # Dev seed script
├── requirements.txt
└── .env.example
```

## Quick start

### 1. Clone and install

```bash
git clone <your-repo>
cd smartattend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install 'pydantic[email]'
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY
```

### 3. Start PostgreSQL

```bash
# Docker (easiest)
docker run -d \
  --name smartattend-db \
  -e POSTGRES_DB=smartattend \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:16
```

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

Tables are auto-created on startup. Visit http://localhost:8000/docs for Swagger UI.

### 5. Seed demo data

```bash
python seed.py
```

Login credentials:
- Admin   → `admin@smartattend.ai` / `admin123`
- Teacher → `rpatil@jspm.edu.in` / `teacher123`
- Student → `omkar@jspm.edu.in` / `student123`

### 6. Run tests

```bash
pytest tests/ -v
# No PostgreSQL needed — uses SQLite in-memory
```

## Key API endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Any | Get access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Any | Rotate tokens |
| GET | `/api/v1/auth/me` | Any | Current user profile |
| POST | `/api/v1/students` | Admin | Create student account |
| POST | `/api/v1/students/me/face-enroll` | Student | Upload face embedding |
| GET | `/api/v1/students/me/summary` | Student | Attendance summary |
| POST | `/api/v1/teachers` | Admin | Create teacher account |
| POST | `/api/v1/attendance/sessions` | Teacher | Start session + get QR |
| POST | `/api/v1/attendance/sessions/{id}/refresh-qr` | Teacher | Rotate QR (every 30s) |
| PATCH | `/api/v1/attendance/sessions/{id}/close` | Teacher | End session |
| POST | `/api/v1/attendance/mark` | Student | Submit QR token + face embedding |
| GET | `/api/v1/attendance/courses/{id}/defaulters` | Teacher | Defaulter list |
| POST | `/api/v1/departments` | Admin | Create department |
| POST | `/api/v1/courses` | Admin | Create course |

## Attendance flow (end to end)

```
Teacher  →  POST /sessions          →  gets QR image (base64 PNG)
         →  display QR in classroom
         →  POST /sessions/{id}/refresh-qr  (every 30 seconds)

Student  →  scans QR with phone
         →  client captures face, runs DeepFace locally → embedding[]
         →  POST /attendance/mark  { session_token, face_embedding }
         →  server: validate JWT token + cosine similarity check
         →  201 Created or error
```

## Phase 2 — AI face verification

Install DeepFace and FAISS, then update `_verify_face()` in `attendance_service.py`:

```bash
pip install deepface faiss-cpu
```

```python
from deepface import DeepFace
import numpy as np

def get_embedding(image_path: str) -> list[float]:
    result = DeepFace.represent(img_path=image_path, model_name="ArcFace")
    return result[0]["embedding"]

def cosine_similarity(a, b) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
```

## Production checklist

- [ ] Use Alembic for migrations instead of `create_all()`
- [ ] Set `DEBUG=False` in `.env`
- [ ] Use a strong random `SECRET_KEY` (use `openssl rand -hex 32`)
- [ ] Switch to pgvector for embedding storage
- [ ] Add rate limiting (slowapi)
- [ ] Set up AWS S3 for file storage
- [ ] Add Redis for session caching
- [ ] Docker Compose for the full stack
