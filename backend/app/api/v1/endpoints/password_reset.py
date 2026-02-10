from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.db.models import User
from app.core.security import hash_password
from app.core.email import send_otp_email
import random
import time

router = APIRouter()

otp_store: dict = {}

OTP_EXPIRY_SECONDS = 300


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address"
        )

    if user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses OAuth login (Google/Microsoft/GitHub). Password reset is not available."
        )

    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = {
        "otp": otp,
        "created_at": time.time()
    }

    try:
        await send_otp_email(data.email, otp, str(user.full_name))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later."
        )

    return {"message": "OTP has been sent to your email address"}


@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    stored = otp_store.get(data.email)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please request a new OTP."
        )

    if time.time() - stored["created_at"] > OTP_EXPIRY_SECONDS:
        del otp_store[data.email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new OTP."
        )

    if stored["otp"] != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please check and try again."
        )

    return {"message": "OTP verified successfully", "verified": True}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored = otp_store.get(data.email)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found. Please start the forgot password process again."
        )

    if time.time() - stored["created_at"] > OTP_EXPIRY_SECONDS:
        del otp_store[data.email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new OTP."
        )

    if stored["otp"] != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP."
        )

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )

    hashed = hash_password(data.new_password)
    db.query(User).filter(User.id == user.id).update({User.hashed_password: hashed})
    db.commit()

    del otp_store[data.email]

    return {"message": "Password has been reset successfully. You can now login with your new password."}
