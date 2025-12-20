from sqlalchemy.orm import Session
from app.db.models import User, RoleEnum
from app.core.config import settings
from typing import Dict


def determine_user_role(email: str) -> RoleEnum:
    """Determine user role based on email configuration"""
    # Check if admin
    if email in settings.admin_emails_list:
        return RoleEnum.ADMIN
    
    # Check if faculty
    if email in settings.faculty_emails_list:
        return RoleEnum.FACULTY
    
    # Check if student
    if email in settings.student_emails_list:
        return RoleEnum.STUDENT
    
    # Default to student for any other email
    return RoleEnum.STUDENT


def create_or_update_user(db: Session, user_data: Dict) -> User:
    """Create or update user from OAuth data"""
    email = user_data.get("email")
    
    # Always determine the current role based on latest config
    current_role = determine_user_role(email)
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update existing user
        user.full_name = user_data.get("full_name", user.full_name)
        user.profile_picture = user_data.get("profile_picture", user.profile_picture)
        user.oauth_provider = user_data.get("provider", user.oauth_provider)
        user.oauth_id = user_data.get("oauth_id", user.oauth_id)
        # Always update role based on current configuration
        user.role = current_role
    else:
        # Create new user
        user = User(
            email=email,
            full_name=user_data.get("full_name"),
            profile_picture=user_data.get("profile_picture"),
            oauth_provider=user_data.get("provider"),
            oauth_id=user_data.get("oauth_id"),
            role=current_role,
            is_active=True
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    return user
