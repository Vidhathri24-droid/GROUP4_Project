from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole = UserRole.RESEARCHER
    phone_number: str | None = None


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    email_verified: bool
    phone_number: str | None = None
    phone_verified: bool

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    phone_number: str | None = None
    role: UserRole | None = None


class UsernameCheckRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)


class UsernameCheckResponse(BaseModel):
    available: bool
    message: str


class RegistrationStart(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    first_name: str
    last_name: str
    email: EmailStr


class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class SetRegistrationPassword(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)


class RegistrationPhoneRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=20)


class RegistrationPhoneOTPRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=20)
    code: str = Field(min_length=4, max_length=8)


class CompleteRegistrationRequest(BaseModel):
    email: EmailStr
