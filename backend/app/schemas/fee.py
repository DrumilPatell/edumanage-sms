from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class FeeHeadBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    default_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_recurring: bool = True
    is_active: bool = True


class FeeHeadCreate(FeeHeadBase):
    pass


class FeeHeadUpdate(BaseModel):
    code: Optional[str] = Field(default=None, min_length=2, max_length=50)
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = None
    default_amount: Optional[Decimal] = Field(default=None, ge=0)
    is_recurring: Optional[bool] = None
    is_active: Optional[bool] = None


class FeeHeadResponse(FeeHeadBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeeInvoiceItemCreate(BaseModel):
    fee_head_id: Optional[int] = None
    description: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0)


class FeeInvoiceItemResponse(BaseModel):
    id: int
    fee_head_id: Optional[int] = None
    description: str
    amount: Decimal

    class Config:
        from_attributes = True


class FeeInvoiceCreate(BaseModel):
    student_id: int
    issue_date: date
    due_date: date
    discount_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    late_fee_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = None
    items: List[FeeInvoiceItemCreate] = Field(default_factory=list)


class FeeInvoiceResponse(BaseModel):
    id: int
    invoice_no: str
    student_id: int
    student_code: str
    student_name: str
    issue_date: date
    due_date: date
    subtotal_amount: Decimal
    discount_amount: Decimal
    late_fee_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_amount: Decimal
    status: Literal["issued", "partial", "paid", "overdue", "cancelled"]
    notes: Optional[str] = None
    items: List[FeeInvoiceItemResponse] = Field(default_factory=list)
    created_at: datetime


class FeePaymentCreate(BaseModel):
    invoice_id: int
    payment_date: date
    amount: Decimal = Field(..., gt=0)
    mode: Literal["cash", "upi", "card", "bank_transfer", "cheque", "online"]
    reference_no: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = None


class FeePaymentResponse(BaseModel):
    id: int
    payment_no: str
    invoice_id: int
    invoice_no: str
    student_id: int
    student_code: str
    student_name: str
    payment_date: date
    amount: Decimal
    mode: str
    reference_no: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime


class FeeSummaryResponse(BaseModel):
    total_invoiced: Decimal
    total_collected: Decimal
    total_outstanding: Decimal
    total_invoices: int
    paid_invoices: int
    overdue_invoices: int
