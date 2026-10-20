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
from typing import Annotated, Literal

from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
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
from app.storage import (
    MAX_UPLOAD_BYTES,
    ImageTooLargeError,
    get_media_file_path,
    save_uploaded_image,
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
    """Response model for a gallery item without private user details."""

    id: int
    title: str
    file_path: str
    owner_id: int
    visibility: Literal["public", "private"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GalleryResponse(BaseModel):
    """Response model containing the requested gallery items."""

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


@app.get("/api/gallery/mine", response_model=GalleryResponse, tags=["Gallery"])
def get_my_gallery(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> GalleryResponse:
    """Return the authenticated user's public and private media records.

    Args:
        current_user: The user identified by the validated session.
        db: The database session provided for this request.

    Returns:
        The user's media ordered by creation time and ID, newest first.

    Raises:
        HTTPException: With status 401 if the authentication dependency rejects
            the session.
    """
    # Determine ownership from the session rather than a client-supplied user ID.
    items = db.scalars(
        select(Media)
        .where(Media.owner_id == current_user.id)
        .order_by(Media.created_at.desc(), Media.id.desc())
    ).all()

    return GalleryResponse(items=[MediaResponse.model_validate(item) for item in items])


@app.post(
    "/api/media",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Media"],
)
def upload_media(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    title: Annotated[str, Form(min_length=1, max_length=100)],
    file: Annotated[UploadFile, File()],
) -> MediaResponse:
    """Upload an image and create a private media record for the current user.

    Args:
        request: The incoming request used to verify the browser's origin.
        current_user: The user identified by the validated session.
        db: The database session provided for this request.
        title: A descriptive title containing 1-100 characters.
        file: A JPEG, PNG, or WebP image sent as multipart form data.

    Returns:
        The newly created private media record.

    Raises:
        HTTPException: With status 400 for invalid images, 401 for an invalid
            session, 403 for an untrusted browser origin, 413 for an oversized
            image, or 422 for invalid form fields.
    """
    # Multipart forms can be submitted across origins even when CORS blocks reading responses.
    origin = request.headers.get("origin")
    if origin is not None and origin not in (frontend_origin, str(request.base_url).rstrip("/")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted request origin")

    title = title.strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="The title must not be blank."
        )

    # Read at most one byte beyond the limit instead of loading an unbounded file.
    contents = file.file.read(MAX_UPLOAD_BYTES + 1)
    try:
        image_path = save_uploaded_image(contents)
    except ImageTooLargeError as error:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail=str(error)
        ) from error
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    media = Media(
        title=title,
        file_path=image_path.name,
        owner_id=current_user.id,
        visibility="private",
    )
    try:
        db.add(media)
        db.flush()
        response = MediaResponse.model_validate(media)
        db.commit()
    except Exception:
        # Keep storage and database consistent when saving the record fails.
        db.rollback()
        image_path.unlink(missing_ok=True)
        raise

    return response


@app.get("/api/media/{media_id}/file", response_class=FileResponse, tags=["Media"])
def get_media_file(
    media_id: int,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> FileResponse:
    """Serve an image after checking its visibility and ownership.

    Args:
        media_id: The ID of the requested media record.
        request: The incoming request containing the session cookie.
        db: The database session provided for this request.

    Returns:
        The image file with browser caching disabled.

    Raises:
        HTTPException: With status 401 if a private image is requested without
            a valid session, or 404 if the record or file is unavailable or
            belongs to another user and is private.
    """
    media = db.get(Media, media_id)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    if media.visibility != "public":
        current_user = get_current_user(request, db)
        if media.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    # Check access before resolving a filename; never accept a file path from the URL.
    try:
        image_path = get_media_file_path(media.file_path)
    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Image not found"
        ) from error

    return FileResponse(
        image_path,
        headers={
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )
