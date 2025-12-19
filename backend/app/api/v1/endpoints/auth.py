from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import httpx
from app.db.database import get_db
from app.auth.oauth import get_oauth_provider
from app.auth.utils import create_or_update_user
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.user import UserWithToken, UserResponse
from app.auth.dependencies import get_current_user
from app.db.models import User
import logging
from fastapi import Header
from typing import Dict
from app.core.security import verify_token

# Development helper: store last generated JWT in memory for quick inspection
_LAST_JWT: str | None = None

router = APIRouter()


@router.get("/{provider}/login")
async def oauth_login(provider: str):
    """Initiate OAuth login by returning the authorization URL"""
    if provider not in ['google', 'microsoft', 'github']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OAuth provider: {provider}"
        )
    
    auth_urls = {
        'google': (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid email profile&"
            f"access_type=offline&"
            f"prompt=select_account"  # Always show account picker
        ),
        'microsoft': (
            f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?"
            f"client_id={settings.MICROSOFT_CLIENT_ID}&"
            f"redirect_uri={settings.MICROSOFT_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid email profile User.Read&"
            f"response_mode=query&"
            f"prompt=select_account"  # Always show account picker
        ),
        'github': (
            f"https://github.com/login/oauth/authorize?"
            f"client_id={settings.GITHUB_CLIENT_ID}&"
            f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
            f"scope=read:user user:email&"
            f"prompt=select_account"  # GitHub uses login parameter for re-authentication
        )
    }
    
    return {"auth_url": auth_urls[provider]}


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    OAuth callback endpoint
    Provider redirects here after user authorizes
    Exchange authorization code for access token and create/update user
    """
    if provider not in ['google', 'microsoft', 'github']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OAuth provider: {provider}"
        )
    
    # Exchange authorization code for access token
    token_urls = {
        'google': 'https://oauth2.googleapis.com/token',
        'microsoft': f'https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token',
        'github': 'https://github.com/login/oauth/access_token'
    }
    
    token_data = {
        'google': {
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code'
        },
        'microsoft': {
            'code': code,
            'client_id': settings.MICROSOFT_CLIENT_ID,
            'client_secret': settings.MICROSOFT_CLIENT_SECRET,
            'redirect_uri': settings.MICROSOFT_REDIRECT_URI,
            'grant_type': 'authorization_code'
        },
        'github': {
            'code': code,
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'redirect_uri': settings.GITHUB_REDIRECT_URI
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {'Accept': 'application/json'} if provider == 'github' else {}
        response = await client.post(
            token_urls[provider],
            data=token_data[provider],
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to obtain access token: {response.text}"
            )
        
        token_response = response.json()
        access_token = token_response.get('access_token')
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token not found in response"
            )
    
    # Get OAuth provider and verify token to get user info
    oauth_provider = get_oauth_provider(provider)
    user_data = await oauth_provider.verify_token(access_token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user information"
        )
    
    # Validate email
    if not user_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by OAuth provider"
        )
    
    # Create or update user in database
    user = create_or_update_user(db, user_data)
    
    # Create internal JWT token
    jwt_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    # Log basic token info for debugging (do NOT log full token in production)
    logging.getLogger(__name__).info("JWT generated in callback: sub=%s email=%s token_len=%s", user.id, user.email, len(jwt_token))
    # Store token in memory for local debugging (DO NOT use in production)
    global _LAST_JWT
    _LAST_JWT = jwt_token
    
    # Redirect to frontend with token
    # Frontend will extract token from URL and store it
    frontend_redirect = f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}&user={user.email}"
    
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=frontend_redirect)


@router.get('/debug-token')
async def debug_token(token: Optional[str] = None, authorization: Optional[str] = Header(None)) -> Dict:
    """Debug endpoint to validate a JWT token passed either as query `token` or Authorization header.
    Returns decoded payload or error for debugging purposes only.
    """
    token_to_check = token
    if not token_to_check and authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            token_to_check = parts[1]

    if not token_to_check:
        return {"ok": False, "detail": "No token provided"}

    payload = verify_token(token_to_check)
    if not payload:
        return {"ok": False, "detail": "Invalid or expired token"}
    return {"ok": True, "payload": payload}


@router.get('/last-jwt')
async def get_last_jwt():
    """Return the last JWT created and its decoded payload (DEV ONLY)"""
    if not _LAST_JWT:
        return {"ok": False, "detail": "No JWT generated yet"}
    payload = verify_token(_LAST_JWT)
    # Also return the raw token string for offline decoding (DEV only)
    return {"ok": True, "token": _LAST_JWT, "token_len": len(_LAST_JWT), "payload": payload}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information"""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint
    In a stateless JWT system, logout is handled on the client side
    by removing the token. This endpoint is mainly for logging purposes.
    """
    return {"message": "Successfully logged out"}
