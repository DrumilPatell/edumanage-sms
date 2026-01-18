from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Student, Course, Enrollment
from app.schemas.enrollment import (
    EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse, EnrollmentWithDetails
)
from app.auth.dependencies import get_current_user, require_admin, require_faculty

router = APIRouter()


@router.get("/", response_model=List[EnrollmentWithDetails])
async def get_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    query = db.query(Enrollment).join(Student).join(Course)
    
    if student_id:
        query = query.filter(Enrollment.student_id == student_id)
    if course_id:
        query = query.filter(Enrollment.course_id == course_id)
    if status:
        query = query.filter(Enrollment.status == status)
    
    enrollments = query.offset(skip).limit(limit).all()
    
    result = []
    for enrollment in enrollments:
        enrollment_dict = EnrollmentResponse.model_validate(enrollment).model_dump()
        enrollment_dict.update({
            "student_name": enrollment.student.user.full_name,
            "student_email": enrollment.student.user.email,
            "course_name": enrollment.course.course_name,
            "course_code": enrollment.course.course_code
        })
        result.append(EnrollmentWithDetails(**enrollment_dict))
    
    return result


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == enrollment.student_id,
        Enrollment.course_id == enrollment.course_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already enrolled in this course"
        )
    
    db_enrollment = Enrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return EnrollmentResponse.model_validate(db_enrollment)


@router.patch("/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    update_data = enrollment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enrollment, field, value)
    
    db.commit()
    db.refresh(enrollment)
    return EnrollmentResponse.model_validate(enrollment)


@router.delete("/{enrollment_id}")
async def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    db.delete(enrollment)
    db.commit()
    return {"message": "Enrollment deleted successfully"}


@router.get("/student/{student_id}/courses", response_model=List[EnrollmentWithDetails])
async def get_student_enrollments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = str(current_user.role)
    if user_role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or getattr(student, 'id', None) != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden"
            )
    
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    
    result = []
    for enrollment in enrollments:
        enrollment_dict = EnrollmentResponse.model_validate(enrollment).model_dump()
        enrollment_dict.update({
            "student_name": enrollment.student.user.full_name,
            "student_email": enrollment.student.user.email,
            "course_name": enrollment.course.course_name,
            "course_code": enrollment.course.course_code
        })
        result.append(EnrollmentWithDetails(**enrollment_dict))
    
    return result
