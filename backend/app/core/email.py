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


async def send_otp_email(email: str, otp: str, full_name: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"EduManage - Password Reset OTP: {otp}"
    msg['From'] = settings.SMTP_USER
    msg['To'] = email

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; text-align: center;">
                    🔐 Password Reset Request
                </h2>

                <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px; text-align: center;">
                    <p style="margin: 10px 0; font-size: 16px;">Hi <strong>{full_name}</strong>,</p>
                    <p style="margin: 10px 0; color: #666;">You requested a password reset for your EduManage account. Use the OTP below to reset your password:</p>

                    <div style="margin: 30px 0; padding: 20px; background-color: #1e293b; border-radius: 10px;">
                        <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f59e0b;">{otp}</p>
                    </div>

                    <p style="margin: 10px 0; color: #999; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>.</p>
                </div>

                <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 5px;">
                    <p style="margin: 0; font-size: 13px; color: #dc2626;">
                        If you did not request this password reset, please ignore this email.
                    </p>
                </div>

                <p style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                    &copy; EduManage SMS - Student Management System
                </p>
            </div>
        </body>
    </html>
    """

    text_content = f"""
    Password Reset OTP

    Hi {full_name},

    Your OTP for password reset is: {otp}

    This OTP is valid for 5 minutes.

    If you did not request this, please ignore this email.
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
