from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import User, Semester
from app.schemas.semester import SemesterCreate, SemesterUpdate, SemesterResponse
from app.auth.dependencies import get_current_user, require_admin, require_faculty

router = APIRouter()


@router.get("/", response_model=List[SemesterResponse])
async def get_semesters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    semesters = db.query(Semester).order_by(Semester.id.desc()).all()
    return semesters


@router.post("/", response_model=SemesterResponse)
async def create_semester(
    semester: SemesterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Create a new semester (Admin only)"""
    existing = db.query(Semester).filter(Semester.name == semester.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Semester '{semester.name}' already exists"
        )
    
    new_semester = Semester(
        name=semester.name,
        start_date=semester.start_date,
        end_date=semester.end_date,
        is_current=False
    )
    db.add(new_semester)
    db.commit()
    db.refresh(new_semester)
    return new_semester


@router.patch("/{semester_id}/set-current")
async def set_current_semester(
    semester_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Set a semester as the current one (Admin only)"""
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester not found"
        )
    
    # Unset all other semesters as current
    db.query(Semester).update({"is_current": False})
    
    # Set this one as current
    db.query(Semester).filter(Semester.id == semester_id).update({"is_current": True})
    db.commit()
    
    return {"message": f"'{semester.name}' is now the current semester"}


@router.delete("/{semester_id}")
async def delete_semester(
    semester_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Delete a semester (Admin only)"""
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester not found"
        )
    
    db.delete(semester)
    db.commit()
    return {"message": f"Semester '{semester.name}' deleted successfully"}
