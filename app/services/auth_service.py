from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.services.email_service import EmailService


class AuthService:

    # ------------------------------------------------------------------
    # Register
    # ------------------------------------------------------------------

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
            raise ValueError("Email already exists")

        verification_token = (
            EmailService.generate_verification_token()
        )

        user = User(
            email=user_data.email,
            password_hash=hash_password(
                user_data.password
            ),
            role=UserRole.RESEARCHER,
            is_active=False,
            email_verified=False,
            verification_token=verification_token,
            verification_token_expiry=(
                EmailService.verification_expiry()
            ),
        )

        created_user = UserRepository.create(
            db,
            user,
        )

        try:
    	    EmailService.send_verification_email(
        	created_user.email,
		verification_token,
    	)
        except Exception as e:
            print(f"Email sending failed: {e}")

        return created_user

    # ------------------------------------------------------------------
    # Login
    # ------------------------------------------------------------------

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

        if not user:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        if not user.email_verified:
            raise ValueError(
                "Please verify your email before logging in."
            )

        token = create_access_token(
            str(user.email)
        )

        return token

    # ------------------------------------------------------------------
    # Verify Email
    # ------------------------------------------------------------------

    @staticmethod
    def verify_email(
        db: Session,
        token: str,
    ):
        user = UserRepository.get_by_verification_token(
            db,
            token,
        )

        if not user:
            raise ValueError(
                "Invalid verification token."
            )

        if user.email_verified:
            return user

        if (
            user.verification_token_expiry is None
            or user.verification_token_expiry < datetime.utcnow()
        ):
            raise ValueError(
                "Verification link has expired."
            )

        user.email_verified = True
        user.is_active = True

        user.verification_token = None
        user.verification_token_expiry = None

        return UserRepository.update(
            db,
            user,
        )

    # ------------------------------------------------------------------
    # Resend Verification Email
    # ------------------------------------------------------------------

    @staticmethod
    def resend_verification(
        db: Session,
        email: str,
    ):
        user = UserRepository.get_by_email(
            db,
            email,
        )

        if not user:
            raise ValueError(
                "User not found."
            )

        if user.email_verified:
            raise ValueError(
                "Email already verified."
            )

        token = EmailService.generate_verification_token()

        user.verification_token = token

        user.verification_token_expiry = (
            EmailService.verification_expiry()
        )

        UserRepository.update(
            db,
            user,
        )

        EmailService.send_verification_email(
            user.email,
            token,
        )

        return {
            "message": "Verification email sent successfully."
        }

    # ------------------------------------------------------------------
    # Forgot Password
    # ------------------------------------------------------------------

    @staticmethod
    def forgot_password(
        db: Session,
        email: str,
    ):
        user = UserRepository.get_by_email(
            db,
            email,
        )

        if not user:
            raise ValueError(
                "No account exists with this email."
            )

        token = EmailService.generate_reset_token()

        user.password_reset_token = token

        user.password_reset_expiry = (
            EmailService.reset_token_expiry()
        )

        UserRepository.update(
            db,
            user,
        )

        EmailService.send_reset_password_email(
            user.email,
            token,
        )

        return {
            "message": "Password reset email sent successfully."
        }

    # ------------------------------------------------------------------
    # Reset Password
    # ------------------------------------------------------------------

    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        password: str,
    ):
        user = UserRepository.get_by_reset_token(
            db,
            token,
        )

        if not user:
            raise ValueError(
                "Invalid password reset token."
            )

        if (
            user.password_reset_expiry is None
            or user.password_reset_expiry < datetime.utcnow()
        ):
            raise ValueError(
                "Password reset link has expired."
            )

        user.password_hash = hash_password(
            password
        )

        user.password_reset_token = None
        user.password_reset_expiry = None

        UserRepository.update(
            db,
            user,
        )

        return {
            "message": "Password reset successfully."
        }
