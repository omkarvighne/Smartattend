from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models import User
from app.services.auth_service import login, refresh

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    return login(payload.email, payload.password, db)


@router.post("/refresh")
def refresh_endpoint(payload: RefreshRequest, db: Session = Depends(get_db)):
    return refresh(payload.refresh_token, db)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }
