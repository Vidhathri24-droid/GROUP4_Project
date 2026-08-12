import os
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.models.user import (
    User,
    UserRole,
)
from app.models.researcher import Researcher

from app.repositories.user_repository import UserRepository

from app.schemas.user import UserCreate

from app.services.email_service import EmailService


class AuthService:

    # ---------------------------------------------------------
    # Register
    # ---------------------------------------------------------

    @staticmethod
    def register(
        db: Session,
        user_data: UserCreate,
    ):

        existing_user = UserRepository.get_by_email(
            db,
            user_data.email,
        )

        if existing_user:
            raise ValueError(
                "Email already registered."
            )

        verification_token = (
            EmailService.generate_verification_token()
        )

        verification_expiry = (
            EmailService.verification_expiry()
        )

        try:

            user = User(
                email=user_data.email,
                password_hash=hash_password(
                    user_data.password,
                ),
                role=user_data.role,
                is_active=False,
                email_verified=False,
                verification_token=verification_token,
                verification_token_expiry=verification_expiry,
            )

            db.add(user)
            db.flush()

            if user.role == UserRole.RESEARCHER:

                researcher = Researcher(
                    user_id=user.id,
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    experience=0,
                )

                db.add(researcher)

            #EmailService.send_verification_email(
               # user.email,
               # verification_token,
            #)

            db.commit()

            db.refresh(user)

            return user

        except Exception:

            db.rollback()

            raise

    # ---------------------------------------------------------
    # Login
    # ---------------------------------------------------------

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ):

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        if not user.email_verified:
            raise ValueError(
                "Please verify your email first."
            )

        if not user.is_active:
            raise ValueError(
                "Your account is not active."
            )

        token = create_access_token(
            str(user.email)
        )

        return token

    # ---------------------------------------------------------
    # Google Login
    # ---------------------------------------------------------

    @staticmethod
    def google_login(
        db: Session,
        credential: str,
    ):
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")

        if not google_client_id:
            raise ValueError(
                "GOOGLE_CLIENT_ID is not configured."
            )

        try:
            # Verify Google ID token
            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                google_client_id,
            )

        except ValueError:
            raise ValueError(
                "Invalid Google authentication token."
            )

        # Google account information
        google_email = idinfo.get("email")
        google_sub = idinfo.get("sub")
        email_verified = idinfo.get("email_verified", False)

        if not google_email:
            raise ValueError(
                "Google account email could not be obtained."
            )

        if not email_verified:
            raise ValueError(
                "Your Google email is not verified."
            )

        # -----------------------------------------------------
        # Find existing user
        # -----------------------------------------------------

        user = UserRepository.get_by_email(
            db,
            google_email,
        )

        # -----------------------------------------------------
        # Existing user
        # -----------------------------------------------------

        if user:

            # Google has verified the email
            user.email_verified = True
            user.is_active = True

            db.commit()
            db.refresh(user)

        # -----------------------------------------------------
        # New Google user
        # -----------------------------------------------------

        else:

            # User model requires a password_hash.
            # Google users do not use this password for login,
            # so generate a random unusable password hash.
            random_password = str(uuid.uuid4())

            user = User(
                email=google_email,
                password_hash=hash_password(
                    random_password
                ),
                role=UserRole.RESEARCHER,
                is_active=True,
                email_verified=True,
                verification_token=None,
                verification_token_expiry=None,
            )

            db.add(user)
            db.flush()

            # Create researcher profile for the new user
            researcher = Researcher(
                user_id=user.id,
                first_name=idinfo.get(
                    "given_name",
                    "",
                ),
                last_name=idinfo.get(
                    "family_name",
                    "",
                ),
                experience=0,
            )

            db.add(researcher)

            db.commit()
            db.refresh(user)

        # -----------------------------------------------------
        # Create SCNA JWT
        # -----------------------------------------------------

        token = create_access_token(
            str(user.email)
        )

        return token

    # ---------------------------------------------------------
    # Verify Email
    # ---------------------------------------------------------

    @staticmethod
    def verify_email(
        db: Session,
        token: str,
    ):

        user = UserRepository.get_by_verification_token(
            db,
            token,
        )

        if user is None:
            raise ValueError(
                "Invalid verification token."
            )

        if user.email_verified:
            raise ValueError(
                "Email already verified."
            )

        if (
            user.verification_token_expiry is None
            or datetime.utcnow()
            > user.verification_token_expiry
        ):
            raise ValueError(
                "Verification token has expired."
            )

        user.email_verified = True
        user.is_active = True

        user.verification_token = None
        user.verification_token_expiry = None

        db.commit()
        db.refresh(user)

        return {
            "message": "Email verified successfully."
        }

    # ---------------------------------------------------------
    # Resend Verification Email
    # ---------------------------------------------------------

    @staticmethod
    def resend_verification(
        db: Session,
        email: str,
    ):

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "User not found."
            )

        if user.email_verified:
            raise ValueError(
                "Email already verified."
            )

        token = (
            EmailService.generate_verification_token()
        )

        expiry = (
            EmailService.verification_expiry()
        )

        user.verification_token = token
        user.verification_token_expiry = expiry

        EmailService.send_verification_email(
            user.email,
            token,
        )

        db.commit()
        db.refresh(user)

        return {
            "message":
                "Verification email sent successfully."
        }

        # ---------------------------------------------------------
    # Forgot Password
    # ---------------------------------------------------------

    @staticmethod
    def forgot_password(
        db: Session,
        email: str,
    ):

        user = UserRepository.get_by_email(
            db,
            email,
        )

        # Return success even if the user doesn't exist
        # to avoid email enumeration.
        if user is None:
            return {
                "message": (
                    "If an account with that email exists, "
                    "a password reset email has been sent."
                )
            }

        token = EmailService.generate_reset_token()

        expiry = EmailService.reset_token_expiry()

        user.password_reset_token = token
        user.password_reset_expiry = expiry

        EmailService.send_reset_password_email(
            user.email,
            token,
        )

        db.commit()

        return {
            "message": (
                "If an account with that email exists, "
                "a password reset email has been sent."
            )
        }

    # ---------------------------------------------------------
    # Reset Password
    # ---------------------------------------------------------

    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        new_password: str,
    ):

        user = UserRepository.get_by_reset_token(
            db,
            token,
        )

        if user is None:
            raise ValueError(
                "Invalid password reset token."
            )

        if (
            user.password_reset_expiry is None
            or datetime.utcnow()
            > user.password_reset_expiry
        ):
            raise ValueError(
                "Password reset token has expired."
            )

        user.password_hash = hash_password(
            new_password,
        )

        user.password_reset_token = None
        user.password_reset_expiry = None

        db.commit()
        db.refresh(user)

        return {
            "message": "Password reset successfully."
        }
