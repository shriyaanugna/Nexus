from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import (
    get_user_by_username_or_email,
    verify_password,
    create_session,
    get_user_by_session_token,
    delete_session,
    create_user
)

router = APIRouter()

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: Optional[str] = "Academic Governance Officer"
    department: Optional[str] = "Institutional Intelligence & Accreditation"

class ForgotPasswordRequest(BaseModel):
    email: str

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication token required")
    token = authorization.replace("Bearer ", "").strip()
    user = get_user_by_session_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return user

@router.post("/auth/login")
def login(req: LoginRequest):
    user = get_user_by_username_or_email(req.username_or_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    if not verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    token = create_session(user["id"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "department": user["department"]
        }
    }

@router.post("/auth/register")
def register(req: RegisterRequest):
    existing = get_user_by_username_or_email(req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    user = create_user(
        username=req.username,
        email=req.email,
        password=req.password,
        full_name=req.full_name,
        role=req.role,
        department=req.department
    )
    token = create_session(user["id"])
    return {
        "token": token,
        "user": user
    }

@router.get("/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

@router.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        delete_session(token)
    return {"status": "logged_out"}

@router.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    # Security requirement: clearly document limitation when external email service is not configured
    return {
        "status": "simulated_recovery",
        "message": "Password recovery request received. Note: External SMTP / Email provider is not configured in this self-contained enterprise environment. Please contact your system administrator or reset via admin CLI.",
        "email": req.email
    }
