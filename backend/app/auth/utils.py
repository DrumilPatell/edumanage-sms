from sqlalchemy.orm import Session
from app.db.models import User, RoleEnum
from app.core.config import settings
from typing import Dict, Any


def determine_user_role(email: str) -> RoleEnum:
    if email in settings.admin_emails_list:
        return RoleEnum.ADMIN
    
    if email in settings.faculty_emails_list:
        return RoleEnum.FACULTY
    
    if email in settings.student_emails_list:
        return RoleEnum.STUDENT
    
    return RoleEnum.STUDENT


def create_or_update_user(db: Session, user_data: Dict[str, Any]) -> User:
    email: str = user_data.get("email", "")
    
    current_role = determine_user_role(email)
    
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        user.full_name = user_data.get("full_name", user.full_name)  
        user.profile_picture = user_data.get("profile_picture", user.profile_picture)  
        user.oauth_provider = user_data.get("provider", user.oauth_provider)  
        user.oauth_id = user_data.get("oauth_id", user.oauth_id)  
        db.query(User).filter(User.id == user.id).update({User.role: current_role})  
    else:
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
