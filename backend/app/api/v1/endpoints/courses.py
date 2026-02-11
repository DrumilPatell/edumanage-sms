from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Course
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseWithFaculty
from app.auth.dependencies import get_current_user, require_admin, require_faculty

router = APIRouter()


@router.get("/", response_model=List[CourseWithFaculty])
async def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    semester: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user)
):
    query = db.query(Course)
    
    if semester:
        query = query.filter(Course.semester == semester)
    if is_active is not None:
        query = query.filter(Course.is_active == is_active)
    
    courses = query.offset(skip).limit(limit).all()
    
    result = []
    for course in courses:
        course_dict = CourseResponse.model_validate(course).model_dump()
        if course.faculty:
            course_dict.update({
                "faculty_name": course.faculty.full_name,
                "faculty_email": course.faculty.email
            })
        result.append(CourseWithFaculty(**course_dict))
    
    return result


@router.get("/{course_id}", response_model=CourseWithFaculty)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    course_dict = CourseResponse.model_validate(course).model_dump()
    if course.faculty:
        course_dict.update({
            "faculty_name": course.faculty.full_name,
            "faculty_email": course.faculty.email
        })
    return CourseWithFaculty(**course_dict)


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin)
):
    existing_course = db.query(Course).filter(Course.course_code == course.course_code).first()
    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course code already exists"
        )
    
    if course.faculty_id:
        faculty = db.query(User).filter(User.id == course.faculty_id).first()
        if not faculty or faculty.role not in ["admin", "faculty"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid faculty ID"
            )
    
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return CourseResponse.model_validate(db_course)


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    update_data = course_update.model_dump(exclude_unset=True)
    if "faculty_id" in update_data and update_data["faculty_id"]:
        faculty = db.query(User).filter(User.id == update_data["faculty_id"]).first()
        if not faculty or faculty.role not in ["admin", "faculty"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid faculty ID"
            )
    
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return CourseResponse.model_validate(course)


@router.patch("/bulk/semester")
async def bulk_update_course_semester(
    semester: str = Query(..., description="New semester value for all courses"),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty)
):
    """Update semester for all courses at once (Admin/Faculty only)"""
    result = db.query(Course).update({"semester": semester})
    db.commit()
    return {"message": f"Successfully updated semester to '{semester}' for {result} courses", "updated_count": result}


@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.get("/faculty/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    courses = db.query(Course).filter(Course.faculty_id == current_user.id).all()
    return [CourseResponse.model_validate(course) for course in courses]
