from pydantic import BaseModel, EmailStr


class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactFormResponse(BaseModel):
    success: bool
    message: str
