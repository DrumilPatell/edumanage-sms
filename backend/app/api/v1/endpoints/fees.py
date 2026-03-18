from datetime import date, datetime
from decimal import Decimal
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import require_faculty
from app.db.database import get_db
from app.db.models import FeeHead, FeeInvoice, FeeInvoiceItem, FeePayment, Student, User
from app.schemas.fee import (
    FeeHeadCreate,
    FeeHeadResponse,
    FeeHeadUpdate,
    FeeInvoiceCreate,
    FeeInvoiceItemResponse,
    FeeInvoiceResponse,
    FeePaymentCreate,
    FeePaymentResponse,
    FeeSummaryResponse,
)

router = APIRouter()


INVOICE_STATUSES = {"issued", "partial", "paid", "overdue", "cancelled"}


def _to_decimal(value: Optional[Decimal]) -> Decimal:
    if value is None:
        return Decimal("0.00")
    return Decimal(str(value)).quantize(Decimal("0.01"))


def _generate_invoice_no(db: Session) -> str:
    stamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    count_today = db.query(FeeInvoice).filter(FeeInvoice.invoice_no.like(f"INV{datetime.utcnow().strftime('%Y%m%d')}%"))\
        .count()
    return f"INV{stamp}{count_today + 1:03d}"


def _generate_payment_no(db: Session) -> str:
    stamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    count_today = db.query(FeePayment).filter(FeePayment.payment_no.like(f"PAY{datetime.utcnow().strftime('%Y%m%d')}%"))\
        .count()
    return f"PAY{stamp}{count_today + 1:03d}"


def _invoice_to_response(invoice: FeeInvoice) -> FeeInvoiceResponse:
    inv: Any = invoice
    student_name = inv.student.user.full_name if inv.student and inv.student.user else ""
    student_code = inv.student.student_id if inv.student else ""
    item_rows = [FeeInvoiceItemResponse.model_validate(item) for item in inv.items]

    return FeeInvoiceResponse(
        id=inv.id,
        invoice_no=inv.invoice_no,
        student_id=inv.student_id,
        student_code=student_code,
        student_name=student_name,
        issue_date=inv.issue_date,
        due_date=inv.due_date,
        subtotal_amount=inv.subtotal_amount,
        discount_amount=inv.discount_amount,
        late_fee_amount=inv.late_fee_amount,
        total_amount=inv.total_amount,
        paid_amount=inv.paid_amount,
        balance_amount=inv.balance_amount,
        status=inv.status,
        notes=inv.notes,
        items=item_rows,
        created_at=inv.created_at,
    )


def _payment_to_response(payment: FeePayment) -> FeePaymentResponse:
    p: Any = payment
    student_name = p.student.user.full_name if p.student and p.student.user else ""
    student_code = p.student.student_id if p.student else ""

    return FeePaymentResponse(
        id=p.id,
        payment_no=p.payment_no,
        invoice_id=p.invoice_id,
        invoice_no=p.invoice.invoice_no,
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


@router.get("/fee-heads", response_model=List[FeeHeadResponse])
async def get_fee_heads(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    query = db.query(FeeHead)
    if not include_inactive:
        query = query.filter(FeeHead.is_active.is_(True))
    return query.order_by(FeeHead.name.asc()).all()


@router.post("/fee-heads", response_model=FeeHeadResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_head(
    payload: FeeHeadCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    existing = db.query(FeeHead).filter(FeeHead.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Fee head code already exists")

    fee_head = FeeHead(**payload.model_dump())
    db.add(fee_head)
    db.commit()
    db.refresh(fee_head)
    return fee_head


@router.patch("/fee-heads/{fee_head_id}", response_model=FeeHeadResponse)
async def update_fee_head(
    fee_head_id: int,
    payload: FeeHeadUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    fee_head = db.query(FeeHead).filter(FeeHead.id == fee_head_id).first()
    if not fee_head:
        raise HTTPException(status_code=404, detail="Fee head not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "code" in update_data and update_data["code"] != fee_head.code:
        duplicate = db.query(FeeHead).filter(FeeHead.code == update_data["code"], FeeHead.id != fee_head_id).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Fee head code already exists")

    for field, value in update_data.items():
        setattr(fee_head, field, value)

    db.commit()
    db.refresh(fee_head)
    return fee_head


@router.delete("/fee-heads/{fee_head_id}")
async def delete_fee_head(
    fee_head_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    fee_head = db.query(FeeHead).filter(FeeHead.id == fee_head_id).first()
    if not fee_head:
        raise HTTPException(status_code=404, detail="Fee head not found")

    if fee_head.invoice_items:
        setattr(fee_head, "is_active", False)
        db.commit()
        return {"message": "Fee head has historical usage and was deactivated"}

    db.delete(fee_head)
    db.commit()
    return {"message": "Fee head deleted successfully"}


@router.get("/invoices", response_model=List[FeeInvoiceResponse])
async def get_invoices(
    student_id: Optional[int] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    query = db.query(FeeInvoice)

    if student_id:
        query = query.filter(FeeInvoice.student_id == student_id)

    if status_filter:
        if status_filter not in INVOICE_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid invoice status filter")
        query = query.filter(FeeInvoice.status == status_filter)

    invoices = query.order_by(FeeInvoice.created_at.desc()).offset(skip).limit(limit).all()
    return [_invoice_to_response(invoice) for invoice in invoices]


@router.get("/invoices/{invoice_id}", response_model=FeeInvoiceResponse)
async def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    invoice = db.query(FeeInvoice).filter(FeeInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _invoice_to_response(invoice)


@router.post("/invoices", response_model=FeeInvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: FeeInvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty),
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not payload.items:
        raise HTTPException(status_code=400, detail="At least one invoice item is required")

    if payload.due_date < payload.issue_date:
        raise HTTPException(status_code=400, detail="Due date cannot be before issue date")

    fee_head_ids = [item.fee_head_id for item in payload.items if item.fee_head_id]
    if fee_head_ids:
        existing_head_ids = {
            head.id for head in db.query(FeeHead).filter(FeeHead.id.in_(fee_head_ids)).all()
        }
        missing = [head_id for head_id in fee_head_ids if head_id not in existing_head_ids]
        if missing:
            raise HTTPException(status_code=400, detail=f"Invalid fee head IDs: {missing}")

    subtotal = sum((_to_decimal(item.amount) for item in payload.items), Decimal("0.00"))
    discount = _to_decimal(payload.discount_amount)
    late_fee = _to_decimal(payload.late_fee_amount)

    total = subtotal - discount + late_fee
    if total < 0:
        raise HTTPException(status_code=400, detail="Discount cannot exceed subtotal plus late fee")

    invoice = FeeInvoice(
        invoice_no=_generate_invoice_no(db),
        student_id=payload.student_id,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        subtotal_amount=subtotal,
        discount_amount=discount,
        late_fee_amount=late_fee,
        total_amount=total,
        paid_amount=Decimal("0.00"),
        balance_amount=total,
        status="paid" if total == 0 else "issued",
        notes=payload.notes,
        created_by=current_user.id,
    )
    db.add(invoice)
    db.flush()

    for item in payload.items:
        invoice_item = FeeInvoiceItem(
            invoice_id=invoice.id,
            fee_head_id=item.fee_head_id,
            description=item.description,
            amount=_to_decimal(item.amount),
        )
        db.add(invoice_item)

    db.commit()
    db.refresh(invoice)
    return _invoice_to_response(invoice)


@router.get("/payments", response_model=List[FeePaymentResponse])
async def get_payments(
    student_id: Optional[int] = None,
    invoice_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    query = db.query(FeePayment)

    if student_id:
        query = query.filter(FeePayment.student_id == student_id)
    if invoice_id:
        query = query.filter(FeePayment.invoice_id == invoice_id)

    payments = query.order_by(FeePayment.created_at.desc()).offset(skip).limit(limit).all()
    return [_payment_to_response(payment) for payment in payments]


@router.post("/payments", response_model=FeePaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: FeePaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty),
):
    invoice = db.query(FeeInvoice).filter(FeeInvoice.id == payload.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if getattr(invoice, "status") == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot collect payment for cancelled invoice")

    amount = _to_decimal(payload.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    if amount > _to_decimal(getattr(invoice, "balance_amount")):
        raise HTTPException(status_code=400, detail="Payment exceeds invoice balance")

    payment = FeePayment(
        payment_no=_generate_payment_no(db),
        invoice_id=invoice.id,
        student_id=invoice.student_id,
        payment_date=payload.payment_date,
        amount=amount,
        mode=payload.mode,
        reference_no=payload.reference_no,
        notes=payload.notes,
        received_by=current_user.id,
        status="posted",
    )
    db.add(payment)

    new_paid_amount = _to_decimal(getattr(invoice, "paid_amount")) + amount
    new_balance_amount = _to_decimal(getattr(invoice, "total_amount")) - new_paid_amount

    if new_balance_amount <= Decimal("0.00"):
        new_balance_amount = Decimal("0.00")
        new_status = "paid"
    elif new_paid_amount > Decimal("0.00"):
        new_status = "partial"
    else:
        new_status = "issued"

    setattr(invoice, "paid_amount", new_paid_amount)
    setattr(invoice, "balance_amount", new_balance_amount)
    setattr(invoice, "status", new_status)

    db.commit()
    db.refresh(payment)
    return _payment_to_response(payment)


@router.get("/summary", response_model=FeeSummaryResponse)
async def get_fee_summary(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_faculty),
):
    total_invoiced = db.query(func.coalesce(func.sum(FeeInvoice.total_amount), 0)).scalar()
    total_collected = db.query(func.coalesce(func.sum(FeePayment.amount), 0)).scalar()
    total_outstanding = db.query(func.coalesce(func.sum(FeeInvoice.balance_amount), 0)).scalar()

    total_invoices = db.query(FeeInvoice).count()
    paid_invoices = db.query(FeeInvoice).filter(FeeInvoice.status == "paid").count()
    overdue_invoices = db.query(FeeInvoice).filter(FeeInvoice.status == "overdue").count()

    return FeeSummaryResponse(
        total_invoiced=_to_decimal(total_invoiced),
        total_collected=_to_decimal(total_collected),
        total_outstanding=_to_decimal(total_outstanding),
        total_invoices=total_invoices,
        paid_invoices=paid_invoices,
        overdue_invoices=overdue_invoices,
    )
