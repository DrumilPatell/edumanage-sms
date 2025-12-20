from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Student, RoleEnum
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentWithUser
from app.auth.dependencies import get_current_user, require_admin, require_faculty

router = APIRouter()


@router.get("/", response_model=List[StudentWithUser])
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    program: Optional[str] = None,
    current_semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Get all students (Faculty and Admin)"""
    query = db.query(Student).join(User)
    
    if program:
        query = query.filter(Student.program == program)
    if current_semester:
        query = query.filter(Student.current_semester == current_semester)
    
    students = query.offset(skip).limit(limit).all()
    
    # Build response with user info
    result = []
    for student in students:
        student_dict = StudentResponse.model_validate(student).model_dump()
        student_dict.update({
            "email": student.user.email,
            "full_name": student.user.full_name,
            "profile_picture": student.user.profile_picture,
            "is_active": student.user.is_active
        })
        result.append(StudentWithUser(**student_dict))
    
    return result


@router.get("/{student_id}", response_model=StudentWithUser)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Get student by ID (Faculty and Admin)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    student_dict = StudentResponse.model_validate(student).model_dump()
    student_dict.update({
        "email": student.user.email,
        "full_name": student.user.full_name,
        "profile_picture": student.user.profile_picture,
        "is_active": student.user.is_active
    })
    return StudentWithUser(**student_dict)


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Create student profile (Admin and Faculty)"""
    # Check if user exists
    user = db.query(User).filter(User.id == student.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if student already exists for this user
    existing_student = db.query(Student).filter(Student.user_id == student.user_id).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile already exists for this user"
        )
    
    # Check if student_id is unique
    existing_student_id = db.query(Student).filter(Student.student_id == student.student_id).first()
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )
    
    # Create student
    db_student = Student(**student.model_dump())
    db.add(db_student)
    
    # Update user role to student if not already
    if user.role != RoleEnum.STUDENT:
        user.role = RoleEnum.STUDENT
    
    db.commit()
    db.refresh(db_student)
    return StudentResponse.model_validate(db_student)


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update student (Admin only)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Update fields
    update_data = student_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    return StudentResponse.model_validate(student)


@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete student (Admin only)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}


@router.get("/me/profile", response_model=StudentWithUser)
async def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's student profile"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    student_dict = StudentResponse.model_validate(student).model_dump()
    student_dict.update({
        "email": current_user.email,
        "full_name": current_user.full_name,
        "profile_picture": current_user.profile_picture,
        "is_active": current_user.is_active
    })
    return StudentWithUser(**student_dict)
