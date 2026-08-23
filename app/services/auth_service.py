import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, status
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session

# Local app imports (In paths ko apne project structure ke hisab se adjust kar sakte ho)
from app.models.user import User  
from app.core.config import settings

# Password Hashing Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT & Expiry Settings
SECRET_KEY = getattr(settings, "SECRET_KEY", "SUPER_SECRET_KEY_DEV_MODE_CHANGE_IN_PROD")
ALGORITHM = getattr(settings, "ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24)


class AuthService:

    # ==========================================
    # 1. PASSWORD & TOKEN HELPERS
    # ==========================================

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Plain password ko hashed password se compare karta hai."""
        if not hashed_password:
            return False
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Bcrypt password hash generate karta hai."""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Signed JWT access token generate karta hai."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        """Incoming JWT token ko decode aur validate karta hai."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """6 digit numeric OTP generate karta hai."""
        return "".join(random.choices(string.digits, k=length))

    # ==========================================
    # 2. MULTI-STEP REGISTRATION & OTP FLOW
    # ==========================================

    @classmethod
    def register_start(cls, db: Session, email: str, name: Optional[str] = None) -> Tuple[User, str]:
        """
        Step 1: User record create karta hai ya existing unverified user dhoondhta hai,
        phir verification OTP generate karta hai.
        """
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Agar user already verified hai aur password set hai
            if getattr(user, 'email_verified', False) and getattr(user, 'password_hash', None):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered and verified. Please login."
                )
        else:
            # New user entry create karo
            user = User(
                email=email,
                name=name or email.split('@')[0],
                is_active=True,
                email_verified=False
            )
            db.add(user)

        # OTP generate karke user record par attach karo
        otp = cls.generate_otp()
        if hasattr(user, 'otp'):
            user.otp = otp
        if hasattr(user, 'otp_created_at'):
            user.otp_created_at = datetime.utcnow()

        db.commit()
        db.refresh(user)
        return user, otp

    @classmethod
    def verify_otp(cls, db: Session, email: str, otp: str) -> User:
        """
        Step 2: OTP verify karke email_verified flag ko True set karta hai.
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        # Basic OTP validation
        stored_otp = getattr(user, 'otp', None)
        if not stored_otp or stored_otp != otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code."
            )

        # Email verify mark karo
        user.email_verified = True
        user.is_active = True
        if hasattr(user, 'otp'):
            user.otp = None  # OTP clear karo verify hone ke baad

        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def set_password(cls, db: Session, email: str, password: str) -> User:
        """
        Step 3: Verified user ke liye final password hash store karta hai.
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        if not getattr(user, 'email_verified', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before setting a password."
            )

        user.password_hash = cls.get_password_hash(password)
        user.is_active = True
        
        db.commit()
        db.refresh(user)
        return user

    # ==========================================
    # 3. AUTHENTICATION / LOGIN
    # ==========================================

    @classmethod
    def authenticate_user(cls, db: Session, email: str, password: str) -> User:
        """
        User Login credentials check karta hai aur accurate 401/403 errors throw karta hai.
        """
        user = db.query(User).filter(User.email == email).first()

        # Check 1: Incorrect Email or Password
        if not user or not user.password_hash or not cls.verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check 2: Unverified Email (Fixes 403 Forbidden Issue)
        if hasattr(user, 'email_verified') and not user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email is not verified. Please verify your OTP first."
            )

        # Check 3: Account Inactive
        if hasattr(user, 'is_active') and not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact support."
            )

        return user