import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_contact_email(name: str, email: str, subject: str, message: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"Contact Form: {subject}"
    msg['From'] = settings.SMTP_USER
    msg['To'] = settings.CONTACT_EMAIL
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
                    New Contact Form Submission
                </h2>
                
                <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 5px;">
                    <p style="margin: 10px 0;"><strong>Name:</strong> {name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> {email}</p>
                    <p style="margin: 10px 0;"><strong>Subject:</strong> {subject}</p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 10px 0;"><strong>Message:</strong></p>
                        <p style="margin: 10px 0; white-space: pre-wrap;">{message}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #f59e0b; border-radius: 5px;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>Reply to:</strong> {email}
                    </p>
                </div>
            </div>
        </body>
    </html>
    """
    
    text_content = f"""
    New Contact Form Submission
    
    Name: {name}
    Email: {email}
    Subject: {subject}
    
    Message:
    {message}
    
    Reply to: {email}
    """
    
    part1 = MIMEText(text_content, 'plain')
    part2 = MIMEText(html_content, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
