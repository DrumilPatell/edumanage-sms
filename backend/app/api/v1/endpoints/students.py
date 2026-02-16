from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Student, RoleEnum
from app.schemas.student import StudentCreate, StudentCreateWithUser, StudentUpdate, StudentResponse, StudentWithUser
from app.auth.dependencies import get_current_user, require_admin, require_faculty
from app.core.security import hash_password

router = APIRouter()


@router.get("/", response_model=List[StudentWithUser])
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    program: Optional[str] = None,
    current_semester: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    print(f"[DEBUG] get_students called by user: {current_user.email}, role: {current_user.role}")
    query = db.query(Student).join(User)
    
    if program:
        query = query.filter(Student.program == program)
    if current_semester:
        query = query.filter(Student.current_semester == current_semester)
    
    students = query.offset(skip).limit(limit).all()
    print(f"[DEBUG] Found {len(students)} students in database")
    
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
    
    print(f"[DEBUG] Returning {len(result)} students")
    return result


@router.get("/{student_id}", response_model=StudentWithUser)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
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
    if student.user_id:
        user = db.query(User).filter(User.id == student.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        existing_student = db.query(Student).filter(Student.user_id == student.user_id).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student profile already exists for this user"
            )
    
    existing_student_id = db.query(Student).filter(Student.student_id == student.student_id).first()
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )
    
    student_data = student.model_dump()
    if not student_data.get('user_id'):
        student_data.pop('user_id', None)
        db_student = Student(**student_data)
    else:
        db_student = Student(**student_data)
        user = db.query(User).filter(User.id == student.user_id).first()
        if user is not None and str(user.role) != RoleEnum.STUDENT.value:
            user.role = RoleEnum.STUDENT  # type: ignore
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return StudentResponse.model_validate(db_student)


@router.post("/with-user", response_model=StudentWithUser, status_code=status.HTTP_201_CREATED)
async def create_student_with_user(
    student: StudentCreateWithUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    existing_student_id = db.query(Student).filter(Student.student_id == student.student_id).first()
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )
    
    existing_user = db.query(User).filter(User.email == student.email).first()
    
    if existing_user:
        existing_student = db.query(Student).filter(Student.user_id == existing_user.id).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A student profile already exists for this email"
            )
        
        db_student = Student(
            user_id=existing_user.id,
            student_id=student.student_id,
            date_of_birth=student.date_of_birth,
            phone=student.phone,
            address=student.address,
            enrollment_year=student.enrollment_year,
            program=student.program,
            current_semester=student.current_semester,
            status=student.status or "active"
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        
        student_dict = StudentResponse.model_validate(db_student).model_dump()
        student_dict.update({
            "email": existing_user.email,
            "full_name": existing_user.full_name,
            "profile_picture": existing_user.profile_picture,
            "is_active": existing_user.is_active
        })
        return StudentWithUser(**student_dict)
    
    new_user = User(
        email=student.email,
        full_name=student.full_name,
        hashed_password=hash_password(student.password or "Student@123"),
        role=RoleEnum.STUDENT,
        is_active=True
    )
    db.add(new_user)
    db.flush()
    
    db_student = Student(
        user_id=new_user.id,
        student_id=student.student_id,
        date_of_birth=student.date_of_birth,
        phone=student.phone,
        address=student.address,
        enrollment_year=student.enrollment_year,
        program=student.program,
        current_semester=student.current_semester,
        status=student.status or "active"
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    db.refresh(new_user)
    
    student_dict = StudentResponse.model_validate(db_student).model_dump()
    student_dict.update({
        "email": new_user.email,
        "full_name": new_user.full_name,
        "profile_picture": new_user.profile_picture,
        "is_active": new_user.is_active
    })
    return StudentWithUser(**student_dict)


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    update_data = student_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    return StudentResponse.model_validate(student)


@router.patch("/bulk/semester")
async def bulk_update_semester(
    semester: str = Query(..., description="New semester value for all students"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update semester for all students at once (Admin only)"""
    result = db.query(Student).update({Student.current_semester: semester})
    db.commit()
    return {"message": f"Successfully updated semester to '{semester}' for {result} students", "updated_count": result}


@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
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
