from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas import LoginRequest, RefreshRequest, TokenResponse, UserRead
from app.services.auth_service import login, refresh

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate any user (student / teacher / admin) and return JWT tokens."""
    return login(payload, db)


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a refresh token for a new token pair."""
    return refresh(payload.refresh_token, db)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return current_user
