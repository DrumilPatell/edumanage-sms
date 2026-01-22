from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    enrollment_date: Optional[datetime] = None


class EnrollmentUpdate(BaseModel):
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    enrollment_date: Optional[datetime] = None
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
    student_code: str  # The student ID like STU001
    course_name: str
    course_code: str
