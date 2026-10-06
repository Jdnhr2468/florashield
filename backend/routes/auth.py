from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.database import get_db
from database.models import User
from utils.security import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
import secrets
from datetime import datetime, timedelta
from utils.email_service import send_reset_email, send_verification_email

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    verification_token = secrets.token_urlsafe(32)

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_token=verification_token,
        verification_token_expiry=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verify_link = f"http://localhost:3000/verify-email?token={verification_token}"
    try:
        send_verification_email(new_user.email, verify_link)
    except Exception as e:
        print(f"VERIFICATION EMAIL ERROR: {type(e).__name__}: {str(e)}")
        # Регистрацию не откатываем — пользователь может запросить письмо повторно

    return {"message": "Registration successful. Please check your email to verify your account."}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/token")
def login_for_docs(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == data.token).first()

    if not user or not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None
    db.commit()

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(data: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"message": "If this email exists, a verification link has been sent."}

    if user.is_verified:
        return {"message": "This email is already verified."}

    verification_token = secrets.token_urlsafe(32)
    user.verification_token = verification_token
    user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    verify_link = f"http://localhost:3000/verify-email?token={verification_token}"
    try:
        send_verification_email(user.email, verify_link)
    except Exception as e:
        print(f"VERIFICATION EMAIL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")

    return {"message": "If this email exists, a verification link has been sent."}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"message": "If this email exists, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    reset_link = f"http://localhost:3000/reset-password?token={token}"

    try:
        send_reset_email(user.email, reset_link)
    except Exception as e:
        print(f"EMAIL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user.password_hash = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Password reset successfully"}