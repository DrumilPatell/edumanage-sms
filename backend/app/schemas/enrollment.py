from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None  # active, completed, dropped, withdrawn



class EnrollmentResponse(EnrollmentBase):
    id: int
    enrollment_date: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class EnrollmentWithDetails(EnrollmentResponse):
    student_name: str
    student_email: str
    course_name: str
    course_code: str
