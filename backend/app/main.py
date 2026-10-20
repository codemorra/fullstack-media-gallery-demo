"""
This is the main entry point for the FastAPI backend application.
It defines the API endpoints, request/response models, and handles
user authentication and session management.

The application uses SQLAlchemy for database interactions and
Pydantic for data validation and serialization.

Environment variables are loaded from a .env file located in the
backend directory. The application requires SESSION_SECRET and
FRONTEND_ORIGIN to be set in the .env file for session management
and CORS.
"""

import os
from collections.abc import Generator
from datetime import datetime
from pathlib import Path
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.database import SessionLocal
from app.models import Media, User
from app.security import (
    DUMMY_PASSWORD_HASH,
    hash_password,
    verify_password,
)

# Load environment variables from .env file
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

# Retrieve session secret and frontend origin from environment variables
session_secret = os.getenv("SESSION_SECRET")
frontend_origin = os.getenv("FRONTEND_ORIGIN")

# Validate that required environment variables are set
if not session_secret or not frontend_origin:
    raise RuntimeError("SESSION_SECRET and FRONTEND_ORIGIN must be set in .env file")

app = FastAPI(title="Fullstack Media Gallery API")

# Add CORS and session middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Add session middleware with the secret key and security settings
app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    same_site="lax",
    https_only=os.getenv("ENVIRONMENT") == "production",
)


class RegisterData(BaseModel):
    """Request model for user registration."""

    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class LoginData(BaseModel):
    """Request model for user login."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Response model for user data."""

    id: int
    username: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class MediaResponse(BaseModel):
    """Response model for a public gallery item without private user details."""

    id: int
    title: str
    file_path: str
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GalleryResponse(BaseModel):
    """Response model containing the public gallery items."""

    items: list[MediaResponse]


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request, db: Annotated[Session, Depends(get_db)]) -> User:
    """Dependency that retrieves the currently authenticated user based on the session."""
    user_id = request.session.get("user_id")

    # Validate that the user is authenticated
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # Retrieve the user from the database
    user = db.get(User, user_id)

    # If the user does not exist, clear the session and raise an error
    if user is None:
        request.session.clear()

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return user


@app.get("/api/health", tags=["Health"])
def health() -> dict[str, str]:
    """Health check endpoint to verify that the API is running."""
    return {"status": "ok"}


@app.post(
    "/api/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register_user(data: RegisterData, db: Annotated[Session, Depends(get_db)]) -> User:
    """Endpoint to register a new user. Validates the input data, checks for existing users,
    hashes the password, and creates a new user in the database."""
    email = str(data.email).lower()

    # Check if a user with the same email already exists
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    # Create a new user with the provided data and hashed password
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
def login_user(
    data: LoginData, request: Request, db: Annotated[Session, Depends(get_db)]
) -> User:
    """Endpoint to log in a user. Validates the input data, checks the credentials,
    and sets the user ID in the session if successful."""
    email = str(data.email).lower()
    user = db.scalar(select(User).where(User.email == email))

    # If the user does not exist or the password is incorrect, raise an HTTP 401 error
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
    """Endpoint to log out the current user by clearing the session."""
    request.session.clear()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get(
    "/api/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
)
def get_current_user_route(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Endpoint to retrieve the currently authenticated user's information."""
    return current_user


@app.get("/api/gallery", response_model=GalleryResponse, tags=["Gallery"])
def get_gallery(db: Annotated[Session, Depends(get_db)]) -> GalleryResponse:
    """Return public media records without requiring authentication.

    Args:
        db: The database session provided for this request.

    Returns:
        Public gallery items ordered by creation time, newest first.
        Items created at the same time are ordered by descending ID.
    """
    # Filter in the database so private records never enter the public response.
    items = db.scalars(
        select(Media)
        .where(Media.visibility == "public")
        .order_by(Media.created_at.desc(), Media.id.desc())
    ).all()

    return GalleryResponse(items=[MediaResponse.model_validate(item) for item in items])
