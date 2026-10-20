"""
Create fictional users and sample media records for local development.
Run this module after applying the database migrations.
"""

from getpass import getpass

from sqlalchemy import inspect, or_, select
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models import Media, User
from app.security import hash_password

DEMO_USERS = (
    ("demo_alex", "demo.alex@example.com"),
    ("demo_sam", "demo.sam@example.com"),
)


def seed_demo_data(db: Session, password: str) -> tuple[int, int]:
    """Add missing demo records without modifying existing users or media.

    The caller manages the transaction so that all changes are committed or
    rolled back together.

    Args:
        db: The database session to use for seeding.
        password: The password to hash for newly created demo users.

    Returns:
        A tuple containing the number of created users, followed by the number
        of created media records.

    Raises:
        ValueError: If the password is outside the 10-128 character range or
            existing account details conflict with a demo username or email.
    """
    if not 10 <= len(password) <= 128:
        raise ValueError("The demo password must contain between 10 and 128 characters.")

    users = []
    created_users = 0
    created_media = 0

    for username, email in DEMO_USERS:
        # Stop on conflicting account details instead of taking over an existing account.
        matches = db.scalars(
            select(User).where(or_(User.email == email, User.username == username))
        ).all()

        if matches:
            if len(matches) != 1 or matches[0].email != email or matches[0].username != username:
                raise ValueError(f"A different account already uses {username} or {email}.")
            user = matches[0]
        else:
            user = User(username=username, email=email, password_hash=hash_password(password))
            db.add(user)
            db.flush()
            created_users += 1

        users.append(user)

    for index in range(1, 7):
        owner = users[0] if index <= 3 else users[1]
        file_path = f"sample_{index:03d}.webp"

        existing_media = db.scalar(
            select(Media).where(Media.owner_id == owner.id, Media.file_path == file_path)
        )
        if existing_media is not None:
            continue

        # These records reference the existing frontend samples; no files are copied.
        db.add(
            Media(
                title=f"Sample {index:02d}",
                file_path=file_path,
                owner=owner,
                visibility="private" if index in (3, 6) else "public",
            )
        )
        created_media += 1

    return created_users, created_media


def main() -> None:
    """Seed the local database using an interactively supplied demo password.

    Raises:
        SystemExit: If the required tables are missing, the password is invalid,
            or existing account details conflict with the demo accounts.
    """
    if not {"users", "media"}.issubset(inspect(engine).get_table_names()):
        raise SystemExit("Apply the database migrations first: alembic upgrade head")

    password = getpass("Password for newly created demo users (10-128 characters): ")

    try:
        with SessionLocal.begin() as db:
            created_users, created_media = seed_demo_data(db, password)
    except ValueError as error:
        raise SystemExit(str(error)) from error

    print(f"Created {created_users} demo users and {created_media} media records.")
    print("Demo accounts: demo.alex@example.com, demo.sam@example.com")
    print("Existing passwords and media records were left unchanged.")


if __name__ == "__main__":
    main()
