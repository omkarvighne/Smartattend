"""
QR Service
- Generates encrypted session tokens (JWT-based so they self-expire)
- Renders QR code as a URL so phone cameras open the app directly
  URL format: http://<FRONTEND_URL>/attendance/mark?token=<JWT>
"""

import base64
import io
from datetime import datetime, timedelta, timezone

import qrcode
from jose import jwt

from app.core.config import settings


def _qr_payload(session_id: int, teacher_id: int) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "session_id": session_id,
        "teacher_id": teacher_id,
        "type": "qr_token",
        "iat": now,
        "exp": now + timedelta(seconds=settings.QR_REFRESH_SECONDS),
    }


def generate_qr_token(session_id: int, teacher_id: int) -> tuple[str, datetime]:
    """Return (signed_jwt_token, expiry_datetime)."""
    payload = _qr_payload(session_id, teacher_id)
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.QR_REFRESH_SECONDS)
    return token, expires_at


def token_to_qr_image_b64(token: str) -> str:
    """
    Encode a full attendance URL into a QR code.
    When a student scans this with ANY phone camera, it opens:
      http://<FRONTEND_URL>/attendance/mark?token=<JWT>
    which auto-fills the token and starts face verification.
    """
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    url = f"{frontend_url}/attendance/mark?token={token}"

    qr = qrcode.QRCode(
        version=None,                          # auto size
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def validate_qr_token(token: str) -> dict:
    """
    Decode and validate a QR token.
    Returns the payload dict or raises jose.JWTError.
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("type") != "qr_token":
        raise ValueError("Token is not a QR token")
    return payload
