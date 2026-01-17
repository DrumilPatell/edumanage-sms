from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.database import get_db
from app.db.models import User, Attendance, Grade
from app.schemas.academic import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    GradeCreate, GradeUpdate, GradeResponse
)
from app.auth.dependencies import get_current_user, require_faculty

router = APIRouter()


@router.get("/attendance/", response_model=List[AttendanceResponse])
async def get_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    student_id: int = None,
    course_id: int = None,
    date_from: date = None,
    date_to: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    query = db.query(Attendance)
    
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if course_id:
        query = query.filter(Attendance.course_id == course_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    
    attendance = query.offset(skip).limit(limit).all()
    return [AttendanceResponse.model_validate(record) for record in attendance]


@router.post("/attendance/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    existing = db.query(Attendance).filter(
        Attendance.student_id == attendance.student_id,
        Attendance.course_id == attendance.course_id,
        Attendance.date == attendance.date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this date"
        )
    
    db_attendance = Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return AttendanceResponse.model_validate(db_attendance)


@router.patch("/attendance/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    update_data = attendance_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(attendance, field, value)
    
    db.commit()
    db.refresh(attendance)
    return AttendanceResponse.model_validate(attendance)


@router.get("/grades/", response_model=List[GradeResponse])
async def get_grades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    student_id: int = None,
    course_id: int = None,
    assessment_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Grade)
    
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    if course_id:
        query = query.filter(Grade.course_id == course_id)
    if assessment_type:
        query = query.filter(Grade.assessment_type == assessment_type)
    
    grades = query.offset(skip).limit(limit).all()
    return [GradeResponse.model_validate(grade) for grade in grades]


@router.post("/grades/", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def create_grade(
    grade: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    db_grade = Grade(**grade.model_dump())
    
    if grade.max_score > 0:
        db_grade.percentage = (grade.score / grade.max_score) * 100
    
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return GradeResponse.model_validate(db_grade)


@router.patch("/grades/{grade_id}", response_model=GradeResponse)
async def update_grade(
    grade_id: int,
    grade_update: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade record not found"
        )
    
    update_data = grade_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grade, field, value)
    
    if "score" in update_data or "max_score" in update_data:
        if grade.max_score > 0:
            grade.percentage = (grade.score / grade.max_score) * 100
    
    db.commit()
    db.refresh(grade)
    return GradeResponse.model_validate(grade)


@router.delete("/grades/{grade_id}")
async def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade record not found"
        )
    
    db.delete(grade)
    db.commit()
    return {"message": "Grade deleted successfully"}
