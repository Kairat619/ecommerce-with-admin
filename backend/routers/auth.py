"""Authentication router using SQLite."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
import aiohttp
import uuid

from sqlalchemy.orm import Session
from config.database import get_db
from config.settings import settings
from schemas.schemas import (
    UserRegister, UserLogin, TokenResponse, TokenRefresh,
    UserResponse, UserUpdate, PasswordChange
)
from models.models import User, RefreshToken
from utils.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_session_cookie(response: Response, token: str):
    """Set session cookie with environment-appropriate settings."""
    if settings.DEBUG:
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    else:
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )


def get_user_by_email(db: Session, email: str):
    """Get user by email."""
    return db.query(User).filter(User.email == email, User.is_deleted == False).first()


def get_user_by_id(db: Session, user_id: str):
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id, User.is_deleted == False, User.is_active == True).first()


def user_to_dict(user: User, include_password: bool = False):
    """Convert user model to dictionary."""
    data = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "phone": user.phone,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "is_active": user.is_active,
        "is_deleted": user.is_deleted,
        "auth_provider": user.auth_provider,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }
    if include_password:
        data["password_hash"] = user.password_hash
    return data


@router.post("/register", response_model=TokenResponse)
async def register(
    data: UserRegister,
    response: Response,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        picture=None,
        phone=None,
        role="customer",
        is_active=True,
        is_deleted=False,
        auth_provider="local"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token({"sub": user.id})
    refresh_token, expires_at = create_refresh_token({"sub": user.id})
    
    refresh_token_obj = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(refresh_token_obj)
    db.commit()
    
    set_session_cookie(response, access_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login with email and password."""
    user = get_user_by_email(db, data.email)
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled"
        )
    
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    user_id = user.id
    
    access_token = create_access_token({"sub": user_id})
    refresh_token, expires_at = create_refresh_token({"sub": user_id})
    
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update({"is_revoked": True})
    
    refresh_token_obj = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(refresh_token_obj)
    db.commit()
    
    set_session_cookie(response, access_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    data: TokenRefresh,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id = payload.get("sub")
        
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == data.refresh_token,
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        ).first()
        
        if not token_record:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        expires_at = token_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Refresh token expired")
        
        user = get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        token_record.is_revoked = True
        
        access_token = create_access_token({"sub": user_id})
        new_refresh_token, expires_at = create_refresh_token({"sub": user_id})
        
        new_refresh_token_obj = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=user_id,
            token=new_refresh_token,
            expires_at=expires_at,
            is_revoked=False
        )
        db.add(new_refresh_token_obj)
        db.commit()
        
        set_session_cookie(response, access_token)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/google")
async def google_oauth(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Exchange Google OAuth code for app session."""
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    
    body = await request.json()
    code = body.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="code required")
    
    try:
        token_response = await exchange_code_for_tokens(code, settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET, settings.GOOGLE_REDIRECT_URI)
        id_token_verified = id_token.verify_oauth2_token(
            token_response['id_token'],
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    
    email = id_token_verified.get("email")
    name = id_token_verified.get("name")
    picture = id_token_verified.get("picture")
    
    if not email:
        raise HTTPException(status_code=401, detail="Email not provided by Google")
    
    user = get_user_by_email(db, email)
    
    if user:
        user.name = name or user.name
        user.picture = picture or user.picture
        db.commit()
        db.refresh(user)
        user_id = user.id
    else:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=None,
            name=name or email.split("@")[0],
            picture=picture,
            phone=None,
            role="customer",
            is_active=True,
            is_deleted=False,
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
    
    access_token = create_access_token({"sub": user_id})
    refresh_token, expires_at = create_refresh_token({"sub": user_id})
    
    refresh_token_obj_db = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(refresh_token_obj_db)
    db.commit()
    
    set_session_cookie(response, access_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_to_dict(user)
    }


async def exchange_code_for_tokens(code: str, client_id: str, client_secret: str, redirect_uri: str) -> dict:
    """Exchange authorization code for access and ID tokens."""
    token_url = "https://oauth2.googleapis.com/token"
    
    async with aiohttp.ClientSession() as client:
        async with client.post(token_url, data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        }) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise HTTPException(status_code=401, detail=f"Failed to exchange code: {text}")
            return await resp.json()


@router.get("/me", response_model=UserResponse)
async def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user info."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_to_dict(user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update current user info."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.picture is not None:
        user.picture = data.picture
    
    db.commit()
    db.refresh(user)
    
    return user_to_dict(user)


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    request: Request,
    db: Session = Depends(get_db)
):
    """Change user password."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Cannot change password for OAuth accounts"
        )
    
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    user.password_hash = hash_password(data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Logout user."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"is_revoked": True})
    db.commit()
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}


async def get_current_user_from_request(db: Session, request: Request) -> Optional[User]:
    """Get current user from request."""
    token = None
    
    session_token = request.cookies.get("session_token")
    if session_token:
        token = session_token
    else:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = get_user_by_id(db, user_id)
        return user
    except Exception:
        return None
