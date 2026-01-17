from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CourseBase(BaseModel):
    course_code: str = Field(..., description="Unique course code")
    course_name: str
    description: Optional[str] = None
    credits: int = Field(default=3, ge=1, le=6)
    semester: Optional[str] = None
    academic_year: Optional[str] = None


class CourseCreate(CourseBase):
    faculty_id: Optional[int] = None


class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = Field(None, ge=1, le=6)
    faculty_id: Optional[int] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    faculty_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CourseWithFaculty(CourseResponse):
    faculty_name: Optional[str] = None
    faculty_email: Optional[str] = None
