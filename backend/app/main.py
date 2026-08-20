import os

from collections.abc import Generator
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.database import Base, SessionLocal, engine
from app.models import User
from app.security import (
    hash_password,
    DUMMY_PASSWORD_HASH,
    verify_password,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

session_secret = os.getenv("SESSION_SECRET")
frontend_origin = os.getenv("FRONTEND_ORIGIN")

if not session_secret or not frontend_origin:
    raise RuntimeError("SESSION_SECRET and FRONTEND_ORIGIN must be set in .env file")

app = FastAPI(title="Fullstack Media Gallery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    same_site="lax",
    https_only=os.getenv("ENVIRONMENT") == "production",
)

Base.metadata.create_all(bind=engine)


class RegisterData(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class LoginData(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/api/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register_user(data: RegisterData, db: Session = Depends(get_db)) -> User:
    email = str(data.email).lower()

    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    user = User(
        username=data.username,
        email=email,
        password_hash=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.post(
    "/api/auth/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
)
def login_user(data: LoginData, request: Request, db: Session = Depends(get_db)) -> User:
    email = str(data.email).lower()
    user = db.scalar(select(User).where(User.email == email))

    if user is None:
        verify_password(data.password, DUMMY_PASSWORD_HASH)

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    request.session["user_id"] = user.id

    return user


@app.post(
    "/api/auth/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Authentication"],
)
def logout_user(request: Request) -> Response:
    request.session.clear()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
