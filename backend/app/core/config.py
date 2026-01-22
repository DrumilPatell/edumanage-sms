from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    
    # OAuth - Microsoft
    MICROSOFT_CLIENT_ID: str
    MICROSOFT_CLIENT_SECRET: str
    MICROSOFT_REDIRECT_URI: str
    MICROSOFT_TENANT_ID: str = "common"
    
    # OAuth - GitHub
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str
    
    # Frontend
    FRONTEND_URL: str
    
    # Role Assignment
    ADMIN_EMAILS: str = ""
    FACULTY_EMAILS: str = ""
    STUDENT_EMAILS: str = ""
    
    @property
    def admin_emails_list(self) -> List[str]:
        return [email.strip() for email in self.ADMIN_EMAILS.split(",") if email.strip()]
    
    @property
    def faculty_emails_list(self) -> List[str]:
        return [email.strip() for email in self.FACULTY_EMAILS.split(",") if email.strip()]
    
    @property
    def student_emails_list(self) -> List[str]:
        return [email.strip() for email in self.STUDENT_EMAILS.split(",") if email.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
