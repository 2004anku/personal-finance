
from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=1, max_length=128)

    @model_validator(mode="after")
    def validate_passwords(self):
        if self.current_password == self.new_password:
            raise ValueError(
                "New password must differ from current password"
            )

        if self.new_password != self.confirm_password:
            raise ValueError("New passwords do not match")

        return self
