from fastapi import APIRouter, HTTPException
from app.schemas.contact import ContactFormRequest, ContactFormResponse
from app.core.email import send_contact_email
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(contact_data: ContactFormRequest):
    try:
        await send_contact_email(
            name=contact_data.name,
            email=contact_data.email,
            subject=contact_data.subject,
            message=contact_data.message
        )
        
        return ContactFormResponse(
            success=True,
            message="Your message has been sent successfully. We'll get back to you soon!"
        )
    except Exception as e:
        logger.error(f"Failed to send contact email: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send your message. Please try again later or contact us directly via email."
        )
