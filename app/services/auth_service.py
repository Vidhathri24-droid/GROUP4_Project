import os
import uuid
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests

from datetime import datetime, timezone

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
from app.services.phone_service import PhoneService

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
                phone_number=user_data.phone_number,
                phone_verified=False,
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

                EmailService.send_verification_email(
                user.email,
                verification_token,
                )

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

        if user.phone_verified:
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

    @staticmethod
    def send_registration_phone_otp(
        db: Session,
        email: str,
        phone_number: str,
    ):

        email = email.strip().lower()
        phone_number = phone_number.strip()

        # ---------------------------------------------------------
        # Find pending registration
        # ---------------------------------------------------------

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "Registration not found."
            )

        # ---------------------------------------------------------
        # Email must already be verified
        # ---------------------------------------------------------

        if not user.email_verified:
            raise ValueError(
                "Please verify your email first."
            )

        # ---------------------------------------------------------
        # Check whether phone belongs to another user
        # ---------------------------------------------------------

        existing_phone_user = UserRepository.get_by_phone(
            db,
            phone_number,
        )

        if (
            existing_phone_user is not None
            and existing_phone_user.id != user.id
        ):
            raise ValueError(
                "This phone number is already registered."
            )

        # ---------------------------------------------------------
        # Save phone number
        # ---------------------------------------------------------

        user.phone_number = phone_number

        user.phone_verified = False

        db.commit()

        # ---------------------------------------------------------
        # Send Twilio OTP
        # ---------------------------------------------------------

        try:

            status = PhoneService.send_otp(
                phone_number
            )

        except Exception as e:

            db.rollback()

            raise ValueError(
                str(e)
            )

        if status != "pending":

            raise ValueError(
                "Unable to send verification code."
            )

        return {
            "message": "Verification code sent successfully."
        }


    @staticmethod
    def send_registration_phone_otp(
        db: Session,
        email: str,
        phone_number: str,
    ):

        email = email.strip().lower()
        phone_number = phone_number.strip()

        # ---------------------------------------------------------
        # Find pending registration
        # ---------------------------------------------------------

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "Registration not found."
            )

        # ---------------------------------------------------------
        # Email must already be verified
        # ---------------------------------------------------------

        if not user.email_verified:
            raise ValueError(
                "Please verify your email first."
            )

        # ---------------------------------------------------------
        # Check whether phone belongs to another user
        # ---------------------------------------------------------

        existing_phone_user = UserRepository.get_by_phone(
            db,
            phone_number,
        )

        if (
            existing_phone_user is not None
            and existing_phone_user.id != user.id
        ):
            raise ValueError(
                "This phone number is already registered."
            )

        # ---------------------------------------------------------
        # Save phone number
        # ---------------------------------------------------------

        user.phone_number = phone_number

        user.phone_verified = False

        db.commit()

        # ---------------------------------------------------------
        # Send Twilio OTP
        # ---------------------------------------------------------

        try:

            status = PhoneService.send_otp(
                phone_number
            )

        except Exception as e:

            db.rollback()

            raise ValueError(
                str(e)
            )

        if status != "pending":

            raise ValueError(
                "Unable to send verification code."
            )

        return {
            "message": "Verification code sent successfully."
        }

    @staticmethod
    def skip_registration_phone(
        db: Session,
        email: str,
    ):

        email = email.strip().lower()

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "Registration not found."
            )

        if not user.email_verified:
            raise ValueError(
                "Please verify your email first."
            )

        # ---------------------------------------------------------
        # Phone is optional
        # ---------------------------------------------------------

        user.phone_verified = False

        # Email + password are sufficient to activate account.

        user.is_active = True

        db.commit()
        db.refresh(user)

        return {
            "message": "Registration completed successfully."
        }

    @staticmethod
    def check_username(
        db: Session,
        username: str,
    ):

        username = username.strip().lower()

        if not username:
            return {
                "available": False,
                "message": "Username cannot be empty."
            }

        existing_user = UserRepository.get_by_username(
            db,
            username,
        )

        if existing_user:

            return {
                "available": False,
                "message": "Username already exists. Please try another one."
            }

        return {
            "available": True,
            "message": "Username is available."
        }

    @staticmethod
    def start_registration(
        db: Session,
        username: str,
        first_name: str,
        last_name: str,
        email: str,
    ):

        username = username.strip().lower()

        email = email.strip().lower()

        # ---------------------------------------------------------
        # Check username
        # ---------------------------------------------------------

        existing_username = UserRepository.get_by_username(
            db,
            username,
        )

        if existing_username:

            raise ValueError(
                "Username already exists. Please try another one."
            )

        # ---------------------------------------------------------
        # Check email
        # ---------------------------------------------------------

        existing_user = UserRepository.get_by_email(
            db,
            email,
        )

        if existing_user:

            # Already registered/verified account
            if existing_user.email_verified:

                raise ValueError(
                    "An account with this email already exists."
                )

            # Pending account
            #
            # This allows the user to continue registration
            # if they previously entered the email but didn't
            # finish verification.
            if existing_user.username != username:

                raise ValueError(
                    "This email is already being used for a pending registration."
                )

            user = existing_user

        else:

            # -----------------------------------------------------
            # Generate temporary password
            # -----------------------------------------------------

            temporary_password = secrets.token_urlsafe(32)

            user = User(
                username=username,

                email=email,

                password_hash=hash_password(
                    temporary_password
                ),

                role=UserRole.RESEARCHER,

                is_active=False,

                email_verified=False,

                phone_verified=False,
            )

            db.add(user)

            db.flush()

            # -----------------------------------------------------
            # Create researcher profile
            # -----------------------------------------------------

            researcher = Researcher(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                experience=0,
            )

            db.add(researcher)

        # ---------------------------------------------------------
        # Generate OTP
        # ---------------------------------------------------------

        otp = EmailService.generate_email_otp()

        expiry = EmailService.email_otp_expiry()

        user.email_otp = otp

        user.email_otp_expiry = expiry

        db.commit()

        db.refresh(user)

        # ---------------------------------------------------------
        # Send OTP
        # ---------------------------------------------------------

        try:

            EmailService.send_email_otp(
                user.email,
                otp,
            )

        except Exception:

            db.rollback()

            raise ValueError(
                "Unable to send verification email. Please try again."
            )

        return {
            "message": "Verification OTP sent to your email.",
            "email": user.email,
        }

    @staticmethod
    def skip_registration_phone(
        db: Session,
        email: str,
    ):

        email = email.strip().lower()

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "Registration not found."
            )

        if not user.email_verified:
            raise ValueError(
                "Please verify your email first."
            )

        # ---------------------------------------------------------
        # Phone is optional
        # ---------------------------------------------------------

        user.phone_verified = False

        # Email + password are sufficient to activate account.

        user.is_active = True

        db.commit()
        db.refresh(user)

        return {
            "message": "Registration completed successfully."
        }

    @staticmethod
    def verify_registration_email(
        db: Session,
        email: str,
        otp: str,
    ):

        email = email.strip().lower()

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:

            raise ValueError(
                "Registration not found."
            )

        if user.email_verified:

            raise ValueError(
                "Email is already verified."
            )

        if not user.email_otp:

            raise ValueError(
                "No verification OTP found. Please request a new OTP."
            )

        if user.email_otp != otp:

            raise ValueError(
                "Invalid OTP."
            )

        if (
            user.email_otp_expiry is None
            or datetime.now(timezone.utc)
            > user.email_otp_expiry
        ):

            raise ValueError(
                "OTP has expired. Please request a new OTP."
            )

        # ---------------------------------------------------------
        # Verify email
        # ---------------------------------------------------------

        user.email_verified = True

        user.email_otp = None

        user.email_otp_expiry = None

        # Keep inactive until password is created.

        user.is_active = False

        db.commit()

        db.refresh(user)

        return {
            "message": "Email verified successfully."
        }
    # ---------------------------------------------------------
    # Set Registration Password
    # ---------------------------------------------------------

    @staticmethod
    def set_registration_password(
        db: Session,
        email: str,
        password: str,
        confirm_password: str,
    ):

        email = email.strip().lower()

        # -----------------------------------------------------
        # Check passwords
        # -----------------------------------------------------

        if password != confirm_password:
            raise ValueError(
                "Passwords do not match."
            )

        # -----------------------------------------------------
        # Password strength
        # -----------------------------------------------------

        if len(password) < 8:
            raise ValueError(
                "Password must contain at least 8 characters."
            )

        if not any(char.isupper() for char in password):
            raise ValueError(
                "Password must contain at least one uppercase letter."
            )

        if not any(char.islower() for char in password):
            raise ValueError(
                "Password must contain at least one lowercase letter."
            )

        if not any(char.isdigit() for char in password):
            raise ValueError(
                "Password must contain at least one number."
            )

        if not any(
            char in "!@#$%^&*()_+-=[]{}|;:,.<>?/`~"
            for char in password
        ):
            raise ValueError(
                "Password must contain at least one special character."
            )

        # -----------------------------------------------------
        # Find registration
        # -----------------------------------------------------

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise ValueError(
                "Registration not found."
            )

        # -----------------------------------------------------
        # Email must be verified first
        # -----------------------------------------------------

        if not user.email_verified:
            raise ValueError(
                "Please verify your email before setting your password."
            )

        # -----------------------------------------------------
        # Set password
        # -----------------------------------------------------

        user.password_hash = hash_password(
            password
        )

        user.is_active = True

        db.commit()
        db.refresh(user)

        return {
            "message": "Password created successfully."
        }