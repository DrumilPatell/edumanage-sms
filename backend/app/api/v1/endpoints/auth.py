from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import httpx
from app.db.database import get_db
from app.auth.oauth import get_oauth_provider
from app.auth.utils import create_or_update_user
from app.core.security import create_access_token, hash_password, verify_password
from app.core.config import settings
from app.schemas.user import UserWithToken, UserResponse, UserRegister, UserLogin
from app.auth.dependencies import get_current_user
from app.db.models import User
import logging
from fastapi import Header
from typing import Dict
from app.core.security import verify_token

_LAST_JWT: str | None = None

router = APIRouter()


@router.get("/{provider}/login")
async def oauth_login(provider: str):
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
            f"prompt=select_account"
        ),
        'microsoft': (
            f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?"
            f"client_id={settings.MICROSOFT_CLIENT_ID}&"
            f"redirect_uri={settings.MICROSOFT_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid email profile User.Read&"
            f"response_mode=query&"
            f"prompt=select_account"
        ),
        'github': (
            f"https://github.com/login/oauth/authorize?"
            f"client_id={settings.GITHUB_CLIENT_ID}&"
            f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
            f"scope=read:user user:email&"
            f"prompt=select_account"
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
    if provider not in ['google', 'microsoft', 'github']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OAuth provider: {provider}"
        )
    
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
    
    oauth_provider = get_oauth_provider(provider)
    if not oauth_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OAuth provider: {provider}"
        )
    user_data = await oauth_provider.verify_token(access_token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user information"
        )
    
    if not user_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by OAuth provider"
        )
    
    user = create_or_update_user(db, user_data)
    
    jwt_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    logging.getLogger(__name__).info("JWT generated in callback: sub=%s email=%s token_len=%s", user.id, user.email, len(jwt_token))
    global _LAST_JWT
    _LAST_JWT = jwt_token
    
    frontend_redirect = f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}&user={user.email}"
    
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=frontend_redirect)


@router.get('/debug-token')
async def debug_token(token: Optional[str] = None, authorization: Optional[str] = Header(None)) -> Dict:
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
    if not _LAST_JWT:
        return {"ok": False, "detail": "No JWT generated yet"}
    payload = verify_token(_LAST_JWT)
    return {"ok": True, "token": _LAST_JWT, "token_len": len(_LAST_JWT), "payload": payload}


@router.post("/register", response_model=UserWithToken)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user_data.password)
    
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        oauth_provider=None,
        oauth_id=None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        data={
            "sub": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        }
    )
    
    global _LAST_JWT
    _LAST_JWT = access_token
    
    return UserWithToken(
        user=UserResponse.model_validate(new_user),
        access_token=access_token
    )


@router.post("/login", response_model=UserWithToken)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    hashed_pwd = getattr(user, 'hashed_password', None)
    
    if not hashed_pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses OAuth login. Please login with Google, Microsoft, or GitHub."
        )
    
    if not verify_password(credentials.password, hashed_pwd):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    is_active = bool(user.is_active)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    
    global _LAST_JWT
    _LAST_JWT = access_token
    
    return UserWithToken(
        user=UserResponse.model_validate(user),
        access_token=access_token
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}
