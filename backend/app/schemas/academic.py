from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class AttendanceBase(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: str  # present, absent, late, excused
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class AttendanceWithDetails(AttendanceResponse):
    student_name: Optional[str] = None
    course_name: Optional[str] = None
    course_code: Optional[str] = None


class GradeBase(BaseModel):
    student_id: int
    course_id: int
    assessment_type: str  # midterm, final, assignment, quiz, project
    assessment_name: str
    score: float
    max_score: float
    date_assessed: Optional[date] = None
    remarks: Optional[str] = None


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    score: Optional[float] = None
    max_score: Optional[float] = None
    letter_grade: Optional[str] = None
    remarks: Optional[str] = None


class GradeResponse(GradeBase):
    id: int
    percentage: Optional[float] = None
    letter_grade: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
