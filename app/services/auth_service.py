# import os
# import random
# import string
# from datetime import datetime, timedelta
# from typing import Optional, Tuple
# from fastapi import HTTPException, status
# from passlib.context import CryptContext
# from jose import JWTError, jwt
# from sqlalchemy.orm import Session

# # Local app imports
# from app.models.user import User  
# from app.core.config import settings

# # Password Hashing Setup
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # JWT Configuration
# SECRET_KEY = getattr(settings, "SECRET_KEY", "SUPER_SECRET_KEY_DEV_MODE_CHANGE_IN_PROD")
# ALGORITHM = getattr(settings, "ALGORITHM", "HS256")
# ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24)


# class AuthService:

#     # ==========================================
#     # 1. PASSWORD & TOKEN HELPERS
#     # ==========================================

#     @staticmethod
#     def verify_password(plain_password: str, hashed_password: str) -> bool:
#         """Verifies plain text password with stored bcrypt hash."""
#         if not hashed_password:
#             return False
#         return pwd_context.verify(plain_password, hashed_password)

#     @staticmethod
#     def get_password_hash(password: str) -> str:
#         """Generates bcrypt hash from plain text password."""
#         return pwd_context.hash(password)

#     @staticmethod
#     def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#         """Generates JWT token for authenticated users."""
#         to_encode = data.copy()
#         if expires_delta:
#             expire = datetime.utcnow() + expires_delta
#         else:
#             expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
#         to_encode.update({"exp": expire})
#         return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

#     @staticmethod
#     def decode_token(token: str) -> dict:
#         """Decodes and validates JWT token."""
#         try:
#             payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#             return payload
#         except JWTError:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid or expired token",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )

#     @staticmethod
#     def generate_otp(length: int = 6) -> str:
#         """Generates 6-digit numeric OTP."""
#         return "".join(random.choices(string.digits, k=length))

#     # ==========================================
#     # 2. MULTI-STEP REGISTRATION & OTP FLOW
#     # ==========================================

#     @classmethod
#     def register_start(cls, db: Session, email: str, name: Optional[str] = None) -> Tuple[User, str]:
#         """Step 1: Create unverified user and assign OTP."""
#         user = db.query(User).filter(User.email == email).first()

#         if user:
#             if getattr(user, 'email_verified', False) and getattr(user, 'password_hash', None):
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Email already registered and verified. Please login."
#                 )
#         else:
#             user = User(
#                 email=email,
#                 name=name or email.split('@')[0],
#                 is_active=True,
#                 email_verified=False
#             )
#             db.add(user)

#         otp = cls.generate_otp()
#         if hasattr(user, 'otp'):
#             user.otp = otp
#         if hasattr(user, 'otp_created_at'):
#             user.otp_created_at = datetime.utcnow()

#         db.commit()
#         db.refresh(user)
#         return user, otp

#     @classmethod
#     def verify_otp(cls, db: Session, email: str, otp: str) -> User:
#         """Step 2: Verify OTP and set email_verified=True."""
#         user = db.query(User).filter(User.email == email).first()
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found."
#             )

#         stored_otp = getattr(user, 'otp', None)
#         if not stored_otp or stored_otp != otp:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Invalid OTP code."
#             )

#         user.email_verified = True
#         user.is_active = True
#         if hasattr(user, 'otp'):
#             user.otp = None

#         db.commit()
#         db.refresh(user)
#         return user

#     @classmethod
#     def set_password(cls, db: Session, email: str, password: str) -> User:
#         """Step 3: Save password hash for verified account."""
#         user = db.query(User).filter(User.email == email).first()
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found."
#             )

#         # Auto-verify email if password setting is reached
#         user.email_verified = True
#         user.password_hash = cls.get_password_hash(password)
#         user.is_active = True
        
#         db.commit()
#         db.refresh(user)
#         return user

#     # ==========================================
#     # 3. AUTHENTICATION & LOGIN (FIXES 403 & FAILED RESPONSES)
#     # ==========================================

#     @classmethod
#     def authenticate_user(cls, db: Session, email: str, password: str) -> User:
#         """Validates credentials and auto-remedies stale account flags on valid password match."""
#         user = db.query(User).filter(User.email == email).first()

#         # Check 1: User existence & password match
#         if not user or not user.password_hash or not cls.verify_password(password, user.password_hash):
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Incorrect email or password",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )

#         # Auto-heal flags for accounts with correct password
#         needs_commit = False
#         if hasattr(user, 'email_verified') and not user.email_verified:
#             user.email_verified = True
#             needs_commit = True

#         if hasattr(user, 'is_active') and not user.is_active:
#             user.is_active = True
#             needs_commit = True

#         if needs_commit:
#             db.commit()
#             db.refresh(user)

#         return user
import datetime
from typing import Optional
from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session
from app.models.user import User

SECRET_KEY = "SUPER_SECRET_KEY_DEV_MODE_CHANGE_IN_PROD"
ALGORITHM = "HS256"

class AuthService:
    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @classmethod
    def authenticate_user(cls, db: Session, email: str, password: str) -> User:
        """
        TEMPORARY DUMMY BYPASS:
        Kuch bhi email/password hone par auto-login success kar dega.
        """
        # Database me existing user dhoondho
        user = db.query(User).filter(User.email == email).first()

        # Agar email DB me nahi hai, toh instant temporary user create kardo
        if not user:
            user = User(
                email=email if email else "demo@scna.com",
                name="Demo User",
                is_active=True,
                email_verified=True
            )
            try:
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                # Database fail-safe object
                user = User(id=1, email="demo@scna.com", name="Demo User")

        return user