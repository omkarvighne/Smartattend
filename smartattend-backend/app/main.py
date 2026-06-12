from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print(f"✅  {settings.APP_NAME} v{settings.APP_VERSION} started")
    print("📖  Docs: http://localhost:8000/docs")
    yield
    print("👋  Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Smart Attendance Management Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# allow_credentials must be False when allow_origins=["*"]
# For production, replace "*" with your actual frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.students import router as students_router
from app.api.v1.endpoints.teachers import router as teachers_router
from app.api.v1.endpoints.attendance import router as attendance_router
from app.api.v1.endpoints.courses import router as courses_router

PREFIX = "/api/v1"
app.include_router(auth_router,       prefix=PREFIX)
app.include_router(students_router,   prefix=PREFIX)
app.include_router(teachers_router,   prefix=PREFIX)
app.include_router(attendance_router, prefix=PREFIX)
app.include_router(courses_router,    prefix=PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
