from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.db.models import RoleEnum


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    oauth_provider: str
    oauth_id: str
    profile_picture: Optional[str] = None
    role: RoleEnum = RoleEnum.STUDENT


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: RoleEnum


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: RoleEnum
    profile_picture: Optional[str] = None
    oauth_provider: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserWithToken(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
