import httpx
from typing import Dict, Optional
from app.core.config import settings


class OAuthProvider:
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        raise NotImplementedError


class GoogleOAuth(OAuthProvider):
    
    TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    async def verify_token(self, access_token: str) -> Optional[Dict]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code != 200:
                    return None
                
                user_info = response.json()
                
                return {
                    "oauth_id": user_info.get("id"),
                    "email": user_info.get("email"),
                    "full_name": user_info.get("name"),
                    "profile_picture": user_info.get("picture"),
                    "provider": "google"
                }
            except Exception:
                return None


class MicrosoftOAuth(OAuthProvider):
    
    USERINFO_URL = "https://graph.microsoft.com/v1.0/me"
    PHOTO_URL = "https://graph.microsoft.com/v1.0/me/photo/$value"
    
    @staticmethod
    def normalize_microsoft_email(email: str) -> str:
        if "#EXT#@" in email:
            parts = email.split("#EXT#@")[0]
            normalized = parts.replace("_", "@")
            return normalized
        return email
    
    async def verify_token(self, access_token: str) -> Optional[Dict]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code != 200:
                    return None
                
                user_info = response.json()
                
                profile_picture = None
                try:
                    photo_response = await client.get(
                        self.PHOTO_URL,
                        headers={"Authorization": f"Bearer {access_token}"}
                    )
                    if photo_response.status_code == 200:
                        pass
                except Exception:
                    pass
                
                raw_email = user_info.get("userPrincipalName") or user_info.get("mail")
                normalized_email = self.normalize_microsoft_email(raw_email) if raw_email else None
                
                return {
                    "oauth_id": user_info.get("id"),
                    "email": normalized_email,
                    "full_name": user_info.get("displayName"),
                    "profile_picture": profile_picture,
                    "provider": "microsoft"
                }
            except Exception:
                return None


class GitHubOAuth(OAuthProvider):
    
    USERINFO_URL = "https://api.github.com/user"
    EMAILS_URL = "https://api.github.com/user/emails"
    
    async def verify_token(self, access_token: str) -> Optional[Dict]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.USERINFO_URL,
                    headers={
                        "Authorization": f"token {access_token}",
                        "Accept": "application/vnd.github.v3+json"
                    }
                )
                
                if response.status_code != 200:
                    return None
                
                user_info = response.json()
                
                email = user_info.get("email")
                if not email:
                    emails_response = await client.get(
                        self.EMAILS_URL,
                        headers={
                            "Authorization": f"token {access_token}",
                            "Accept": "application/vnd.github.v3+json"
                        }
                    )
                    if emails_response.status_code == 200:
                        emails = emails_response.json()
                        primary_email = next(
                            (e for e in emails if e.get("primary")),
                            emails[0] if emails else None
                        )
                        if primary_email:
                            email = primary_email.get("email")
                
                return {
                    "oauth_id": str(user_info.get("id")),
                    "email": email,
                    "full_name": user_info.get("name") or user_info.get("login"),
                    "profile_picture": user_info.get("avatar_url"),
                    "provider": "github"
                }
            except Exception:
                return None


google_oauth = GoogleOAuth()
microsoft_oauth = MicrosoftOAuth()
github_oauth = GitHubOAuth()


def get_oauth_provider(provider: str) -> Optional[OAuthProvider]:
    providers = {
        "google": google_oauth,
        "microsoft": microsoft_oauth,
        "github": github_oauth,
    }
    return providers.get(provider)
