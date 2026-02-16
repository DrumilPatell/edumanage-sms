from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date


class StudentBase(BaseModel):
    student_id: str = Field(..., description="Unique student ID")
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    enrollment_date: Optional[date] = None
    year_level: Optional[int] = None
    enrollment_year: Optional[int] = None
    program: Optional[str] = None
    current_semester: Optional[str] = None
    status: Optional[Literal["active", "withdrawn", "completed"]] = "active"


class StudentCreate(StudentBase):
    user_id: Optional[int] = None


class StudentCreateWithUser(StudentBase):
    email: str
    full_name: str
    password: Optional[str] = None


class StudentUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    enrollment_date: Optional[date] = None
    year_level: Optional[int] = None
    enrollment_year: Optional[int] = None
    program: Optional[str] = None
    current_semester: Optional[str] = None
    gpa: Optional[float] = None
    status: Optional[Literal["active", "withdrawn", "completed"]] = None


class StudentResponse(StudentBase):
    id: int
    user_id: int
    gpa: Optional[float] = None
    status: Optional[str] = "active"
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class StudentWithUser(StudentResponse):
    email: str
    full_name: str
    profile_picture: Optional[str] = None
    is_active: bool
    status: Optional[str] = "active"
