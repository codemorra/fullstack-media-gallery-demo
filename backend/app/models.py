"""
This module defines the SQLAlchemy models for the application."""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """User model representing a user in the system."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)

    media: Mapped[list["Media"]] = relationship(back_populates="owner")


class Media(Base):
    """Media model representing an image owned by a user."""

    __tablename__ = "media"
    __table_args__ = (
        CheckConstraint(
            "visibility IN ('public', 'private')",
            name="ck_media_visibility",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    # Store a relative storage path instead of an absolute path or public URL.
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # Images are private unless their owner explicitly publishes them.
    visibility: Mapped[str] = mapped_column(
        String(7), nullable=False, server_default="private"
    )
    # SQLite's CURRENT_TIMESTAMP stores the creation time in UTC.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), nullable=False, server_default=func.current_timestamp()
    )

    owner: Mapped["User"] = relationship(back_populates="media")
