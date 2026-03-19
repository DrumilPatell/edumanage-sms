from datetime import date, datetime
from decimal import Decimal
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_admin
from app.db.database import get_db
from app.db.models import (
    Course,
    Enrollment,
    RoleEnum,
    Student,
    StudentCourseFee,
    StudentCourseFeePayment,
    User,
)
from app.schemas.fee import (
    EnrolledCourseOption,
    FeeRecordCreate,
    FeeRecordPaymentCreate,
    FeeRecordPaymentResponse,
    FeeRecordResponse,
    FeeRecordUpdate,
    FeeSummaryResponse,
    StudentFeeDashboardResponse,
)

router = APIRouter()


def _to_decimal(value: Optional[Decimal]) -> Decimal:
    if value is None:
        return Decimal("0.00")
    return Decimal(str(value)).quantize(Decimal("0.01"))


def _compute_status(due_date: date, balance_amount: Decimal) -> str:
    if balance_amount <= Decimal("0.00"):
        return "paid"
    if date.today() > due_date:
        return "overdue"
    return "pending"


def _is_late_fee_applicable(due_date: date, fee_amount: Decimal, late_fee_amount: Decimal, paid_amount: Decimal) -> bool:
    if late_fee_amount <= Decimal("0.00"):
        return False
    if date.today() <= due_date:
        return False
    return paid_amount < (fee_amount + late_fee_amount)


def _recalculate_fee_record(record: StudentCourseFee) -> bool:
    r: Any = record
    fee_amount = _to_decimal(r.fee_amount)
    late_fee = _to_decimal(r.late_fee_amount)
    paid_amount = _to_decimal(r.paid_amount)

    effective_late = late_fee if _is_late_fee_applicable(r.due_date, fee_amount, late_fee, paid_amount) else Decimal("0.00")
    total_amount = fee_amount + effective_late
    balance_amount = total_amount - paid_amount
    if balance_amount < Decimal("0.00"):
        balance_amount = Decimal("0.00")

    status = _compute_status(r.due_date, balance_amount)

    changed = (
        _to_decimal(r.total_amount) != total_amount
        or _to_decimal(r.balance_amount) != balance_amount
        or r.status != status
    )

    if changed:
        setattr(r, "total_amount", total_amount)
        setattr(r, "balance_amount", balance_amount)
        setattr(r, "status", status)

    return changed


def _generate_payment_no(db: Session) -> str:
    stamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    count_today = db.query(StudentCourseFeePayment).filter(
        StudentCourseFeePayment.payment_no.like(f"FEEPAY{datetime.utcnow().strftime('%Y%m%d')}%")
    ).count()
    return f"FEEPAY{stamp}{count_today + 1:03d}"


def _record_to_response(record: StudentCourseFee) -> FeeRecordResponse:
    r: Any = record
    student_name = r.student.user.full_name if r.student and r.student.user else ""
    student_code = r.student.student_id if r.student else ""
    course_name = r.course.course_name if r.course else ""
    course_code = r.course.course_code if r.course else ""

    return FeeRecordResponse(
        id=r.id,
        student_id=r.student_id,
        student_code=student_code,
        student_name=student_name,
        course_id=r.course_id,
        course_code=course_code,
        course_name=course_name,
        issue_date=r.issue_date,
        due_date=r.due_date,
        fee_amount=r.fee_amount,
        late_fee_amount=r.late_fee_amount,
        total_amount=r.total_amount,
        paid_amount=r.paid_amount,
        balance_amount=r.balance_amount,
        status=r.status,
        notes=r.notes,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def _payment_to_response(payment: StudentCourseFeePayment) -> FeeRecordPaymentResponse:
    p: Any = payment
    student_name = p.student.user.full_name if p.student and p.student.user else ""
    student_code = p.student.student_id if p.student else ""

    return FeeRecordPaymentResponse(
        id=p.id,
        payment_no=p.payment_no,
        fee_record_id=p.fee_record_id,
        student_id=p.student_id,
        student_code=student_code,
        student_name=student_name,
        payment_date=p.payment_date,
        amount=p.amount,
        mode=p.mode,
        reference_no=p.reference_no,
        notes=p.notes,
        status=p.status,
        created_at=p.created_at,
    )


def _ensure_enrolled(db: Session, student_id: int, course_id: int) -> None:
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id,
    ).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected student is not enrolled in this course",
        )


@router.get("/student-courses/{student_id}", response_model=List[EnrolledCourseOption])
async def get_student_enrolled_courses(
    student_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    enrollments = db.query(Enrollment).join(Course).filter(Enrollment.student_id == student_id).all()
    result: List[EnrolledCourseOption] = []
    for enrollment in enrollments:
        e: Any = enrollment
        result.append(
            EnrolledCourseOption(
                course_id=e.course_id,
                course_code=e.course.course_code,
                course_name=e.course.course_name,
                enrollment_status=e.status,
                enrollment_date=e.enrollment_date,
            )
        )
    return result


@router.get("/records", response_model=List[FeeRecordResponse])
async def get_fee_records(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    query = db.query(StudentCourseFee)

    if student_id:
        query = query.filter(StudentCourseFee.student_id == student_id)
    if course_id:
        query = query.filter(StudentCourseFee.course_id == course_id)
    if status_filter:
        query = query.filter(StudentCourseFee.status == status_filter)

    records = query.order_by(StudentCourseFee.created_at.desc()).offset(skip).limit(limit).all()

    # Keep late-fee application and status accurate whenever records are fetched.
    dirty = False
    for record in records:
        if _recalculate_fee_record(record):
            dirty = True
    if dirty:
        db.commit()

    return [_record_to_response(record) for record in records]


@router.post("/records", response_model=FeeRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_record(
    payload: FeeRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    _ensure_enrolled(db, payload.student_id, payload.course_id)

    if payload.due_date < payload.issue_date:
        raise HTTPException(status_code=400, detail="Due date cannot be before issue date")

    existing = db.query(StudentCourseFee).filter(
        StudentCourseFee.student_id == payload.student_id,
        StudentCourseFee.course_id == payload.course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Fee record already exists for this student and course")

    late_fee = _to_decimal(payload.late_fee_amount)
    fee_amount = _to_decimal(payload.fee_amount)
    total_amount = fee_amount

    record = StudentCourseFee(
        student_id=payload.student_id,
        course_id=payload.course_id,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        fee_amount=fee_amount,
        late_fee_amount=late_fee,
        total_amount=total_amount,
        paid_amount=Decimal("0.00"),
        balance_amount=total_amount,
        status="pending",
        notes=payload.notes,
        created_by=current_user.id,
        updated_by=current_user.id,
    )

    _recalculate_fee_record(record)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _record_to_response(record)


@router.patch("/records/{record_id}", response_model=FeeRecordResponse)
async def update_fee_record(
    record_id: int,
    payload: FeeRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    record = db.query(StudentCourseFee).filter(StudentCourseFee.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")

    update_data = payload.model_dump(exclude_unset=True)

    issue_date_val = update_data.get("issue_date", record.issue_date)
    due_date_val = update_data.get("due_date", record.due_date)
    if due_date_val < issue_date_val:
        raise HTTPException(status_code=400, detail="Due date cannot be before issue date")

    fee_amount = _to_decimal(update_data.get("fee_amount", record.fee_amount))
    late_fee = _to_decimal(update_data.get("late_fee_amount", record.late_fee_amount))

    for field, value in update_data.items():
        setattr(record, field, value)

    paid_amount = _to_decimal(getattr(record, "paid_amount"))
    # Prevent lowering amounts below what is already paid.
    max_effective_total = fee_amount + late_fee
    if paid_amount > max_effective_total:
        raise HTTPException(status_code=400, detail="Fee amount cannot be less than already paid amount")

    setattr(record, "fee_amount", fee_amount)
    setattr(record, "late_fee_amount", late_fee)
    setattr(record, "updated_by", current_user.id)
    _recalculate_fee_record(record)

    db.commit()
    db.refresh(record)
    return _record_to_response(record)


@router.post("/records/{record_id}/payments", response_model=FeeRecordPaymentResponse, status_code=status.HTTP_201_CREATED)
async def add_fee_payment(
    record_id: int,
    payload: FeeRecordPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    record = db.query(StudentCourseFee).filter(StudentCourseFee.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")

    _recalculate_fee_record(record)

    amount = _to_decimal(payload.amount)
    balance = _to_decimal(getattr(record, "balance_amount"))
    if amount > balance:
        raise HTTPException(status_code=400, detail="Payment exceeds pending balance")

    payment = StudentCourseFeePayment(
        payment_no=_generate_payment_no(db),
        fee_record_id=record.id,
        student_id=record.student_id,
        payment_date=payload.payment_date,
        amount=amount,
        mode=payload.mode,
        reference_no=payload.reference_no,
        notes=payload.notes,
        received_by=current_user.id,
        status="posted",
    )
    db.add(payment)

    paid_amount = _to_decimal(getattr(record, "paid_amount")) + amount
    setattr(record, "paid_amount", paid_amount)
    _recalculate_fee_record(record)
    setattr(record, "updated_by", current_user.id)

    db.commit()
    db.refresh(payment)
    return _payment_to_response(payment)


@router.get("/my-records", response_model=StudentFeeDashboardResponse)
async def get_my_fee_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    normalized_role = str(current_user.role).lower().replace("roleenum.", "")
    if normalized_role != RoleEnum.STUDENT.value:
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    records = db.query(StudentCourseFee).join(Enrollment, (Enrollment.student_id == StudentCourseFee.student_id) & (Enrollment.course_id == StudentCourseFee.course_id)).filter(
        StudentCourseFee.student_id == student.id
    ).order_by(StudentCourseFee.created_at.desc()).all()

    dirty = False
    for record in records:
        if _recalculate_fee_record(record):
            dirty = True
    if dirty:
        db.commit()

    response_records = [_record_to_response(record) for record in records]

    total_fee_assigned = sum((_to_decimal(getattr(r, "total_amount")) for r in records), Decimal("0.00"))
    total_collected = sum((_to_decimal(getattr(r, "paid_amount")) for r in records), Decimal("0.00"))
    total_outstanding = sum((_to_decimal(getattr(r, "balance_amount")) for r in records), Decimal("0.00"))

    summary = FeeSummaryResponse(
        total_fee_assigned=total_fee_assigned,
        total_collected=total_collected,
        total_outstanding=total_outstanding,
        total_records=len(records),
        paid_records=sum(1 for r in records if getattr(r, "status") == "paid"),
        overdue_records=sum(1 for r in records if getattr(r, "status") == "overdue"),
    )

    return StudentFeeDashboardResponse(summary=summary, records=response_records)


@router.get("/summary", response_model=FeeSummaryResponse)
async def get_fee_summary(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    records = db.query(StudentCourseFee).all()
    dirty = False
    for record in records:
        if _recalculate_fee_record(record):
            dirty = True
    if dirty:
        db.commit()

    total_fee_assigned = db.query(func.coalesce(func.sum(StudentCourseFee.total_amount), 0)).scalar()
    total_collected = db.query(func.coalesce(func.sum(StudentCourseFeePayment.amount), 0)).scalar()
    total_outstanding = db.query(func.coalesce(func.sum(StudentCourseFee.balance_amount), 0)).scalar()

    total_records = db.query(StudentCourseFee).count()
    paid_records = db.query(StudentCourseFee).filter(StudentCourseFee.status == "paid").count()
    overdue_records = db.query(StudentCourseFee).filter(StudentCourseFee.status == "overdue").count()

    return FeeSummaryResponse(
        total_fee_assigned=_to_decimal(total_fee_assigned),
        total_collected=_to_decimal(total_collected),
        total_outstanding=_to_decimal(total_outstanding),
        total_records=total_records,
        paid_records=paid_records,
        overdue_records=overdue_records,
    )
