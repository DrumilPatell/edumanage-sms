from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class SemesterBase(BaseModel):
    name: str


class SemesterCreate(SemesterBase):
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SemesterUpdate(BaseModel):
    name: Optional[str] = None
    is_current: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SemesterResponse(SemesterBase):
    id: int
    is_current: bool
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
