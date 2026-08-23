from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.api.dependencies import get_db, get_current_user

from app.schemas.auth import (
    LoginRequest,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest,
    SendPhoneOTPRequest,
    VerifyPhoneOTPRequest,
)

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UsernameCheckRequest,
    RegistrationStart,
    EmailOTPVerify,
    SetRegistrationPassword,
    RegistrationPhoneRequest,
    RegistrationPhoneOTPRequest,
    CompleteRegistrationRequest,
)

from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


# ------------------------------------------------------------------
# Register
# ------------------------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.register(
            db,
            user,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------------------------------------------------
# Login
# ------------------------------------------------------------------

@router.post(
    "/login",
    response_model=Token,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        token = AuthService.login(
            db,
            request.email,
            request.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ------------------------------------------------------------------
# Google Login
# ------------------------------------------------------------------

@router.post("/google")
def google_login(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("credential") or payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token missing")
    
    # User fetch / create logic
    user = db.query(User).filter(User.email == payload.get("email")).first()
    if not user:
        user = User(
            email=payload.get("email"),
            name=payload.get("name", ""),
            email_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = AuthService.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
# ------------------------------------------------------------------
# Send Phone Verification OTP
# ------------------------------------------------------------------

@router.post("/phone/send-otp")
def send_phone_otp(
    request: SendPhoneOTPRequest,
    db: Session = Depends(get_db),
):
    try:

        return AuthService.send_phone_otp(
            db,
            request.phone_number,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------------------------------------------------
# Verify Phone OTP
# ------------------------------------------------------------------

@router.post("/phone/verify-otp")
def verify_phone_otp(
    request: VerifyPhoneOTPRequest,
    db: Session = Depends(get_db),
):
    try:

        return AuthService.verify_phone_otp(
            db,
            request.phone_number,
            request.code,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
# ------------------------------------------------------------------
# Swagger Login
# ------------------------------------------------------------------

@router.post(
    "/token",
    response_model=Token,
)
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        token = AuthService.login(
            db,
            form_data.username,
            form_data.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ------------------------------------------------------------------
# Verify Email
# ------------------------------------------------------------------

@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    try:
        AuthService.verify_email(
            db,
            token,
        )

        return {
            "message": "Email verified successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------------------------------------------------
# Resend Verification
# ------------------------------------------------------------------

@router.post("/resend-verification")
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.resend_verification(
            db,
            request.email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------------------------------------------------
# Forgot Password
# ------------------------------------------------------------------

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.forgot_password(
            db,
            request.email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------------------------------------------------
# Reset Password
# ------------------------------------------------------------------

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.reset_password(
            db,
            request.token,
            request.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# ------------------------------------------------------------------
# Username Check
# ------------------------------------------------------------------
@router.post("/check-username")
def check_username(
    data: UsernameCheckRequest,
    db: Session = Depends(get_db),
):

    return AuthService.check_username(
        db,
        data.username,
    )
#-------------------------------------------------------------------
# Start Registration
#-------------------------------------------------------------------
@router.post("/register/start")
def start_registration(
    data: RegistrationStart,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.start_registration(
            db=db,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            email=str(data.email),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
#-------------------------------------------------------------------
# Verify Email OTP
#-------------------------------------------------------------------
@router.post("/register/verify-email")
def verify_registration_email(
    data: EmailOTPVerify,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.verify_registration_email(
            db=db,
            email=str(data.email),
            otp=data.otp,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# -------------------------------------------------------------------
# Set Registration Password
# -------------------------------------------------------------------

@router.post("/register/set-password")
def set_registration_password(
    data: SetRegistrationPassword,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.set_registration_password(
            db=db,
            email=str(data.email),
            password=data.password,
            confirm_password=data.confirm_password,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# -------------------------------------------------------------------
# Registration - Send Phone OTP
# -------------------------------------------------------------------

@router.post("/register/phone/send-otp")
def send_registration_phone_otp(
    data: RegistrationPhoneRequest,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.send_registration_phone_otp(
            db=db,
            email=str(data.email),
            phone_number=data.phone_number,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# -------------------------------------------------------------------
# Registration - Verify Phone OTP
# -------------------------------------------------------------------

@router.post("/register/phone/verify-otp")
def verify_registration_phone_otp(
    data: RegistrationPhoneOTPRequest,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.verify_registration_phone_otp(
            db=db,
            email=str(data.email),
            phone_number=data.phone_number,
            code=data.code,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# -------------------------------------------------------------------
# Registration - Skip Phone
# -------------------------------------------------------------------

@router.post("/register/phone/skip")
def skip_registration_phone(
    data: CompleteRegistrationRequest,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.skip_registration_phone(
            db=db,
            email=str(data.email),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# -------------------------------------------------------------------
# Complete Registration
# -------------------------------------------------------------------

@router.post("/register/complete")
def complete_registration(
    data: CompleteRegistrationRequest,
    db: Session = Depends(get_db),
):

    try:

        return AuthService.complete_registration(
            db=db,
            email=str(data.email),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# ------------------------------------------------------------------
# Current User
# ------------------------------------------------------------------

@router.get("/me")
def me(
    current_user=Depends(get_current_user),
):
    return current_user
