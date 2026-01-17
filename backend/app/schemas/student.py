from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class StudentBase(BaseModel):
    student_id: str = Field(..., description="Unique student ID")
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    enrollment_year: Optional[int] = None
    program: Optional[str] = None
    current_semester: Optional[int] = None


class StudentCreate(StudentBase):
    user_id: int


class StudentUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    enrollment_year: Optional[int] = None
    program: Optional[str] = None
    current_semester: Optional[int] = None
    gpa: Optional[float] = None


class StudentResponse(StudentBase):
    id: int
    user_id: int
    gpa: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class StudentWithUser(StudentResponse):
    email: str
    full_name: str
    profile_picture: Optional[str] = None
    is_active: bool
