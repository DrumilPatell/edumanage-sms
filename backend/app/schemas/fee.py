from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Literal, List

from pydantic import BaseModel, Field


FeeStatus = Literal["pending", "partial", "paid", "overdue"]
PaymentMode = Literal["cash", "upi", "card", "bank_transfer", "cheque", "online"]


class EnrolledCourseOption(BaseModel):
    course_id: int
    course_code: str
    course_name: str
    enrollment_status: str
    enrollment_date: datetime


class FeeRecordBase(BaseModel):
    student_id: int
    course_id: int
    issue_date: date
    due_date: date
    fee_amount: Decimal = Field(..., gt=0)
    late_fee_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = None


class FeeRecordCreate(FeeRecordBase):
    pass


class FeeRecordUpdate(BaseModel):
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    fee_amount: Optional[Decimal] = Field(default=None, gt=0)
    late_fee_amount: Optional[Decimal] = Field(default=None, ge=0)
    notes: Optional[str] = None


class FeeRecordResponse(BaseModel):
    id: int
    student_id: int
    student_code: str
    student_name: str
    course_id: int
    course_code: str
    course_name: str
    issue_date: date
    due_date: date
    fee_amount: Decimal
    late_fee_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_amount: Decimal
    status: FeeStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class FeeRecordPaymentCreate(BaseModel):
    payment_date: date
    amount: Decimal = Field(..., gt=0)
    mode: PaymentMode
    reference_no: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = None


class FeeRecordPaymentResponse(BaseModel):
    id: int
    payment_no: str
    fee_record_id: int
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
    total_fee_assigned: Decimal
    total_collected: Decimal
    total_outstanding: Decimal
    total_records: int
    paid_records: int
    overdue_records: int


class StudentFeeDashboardResponse(BaseModel):
    summary: FeeSummaryResponse
    records: List[FeeRecordResponse]
