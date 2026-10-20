"""create media table

Revision ID: 82e641b9a37f
Revises: c193bef2cdd3
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "82e641b9a37f"
down_revision: Union[str, Sequence[str], None] = "c193bef2cdd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the media table with ownership and visibility constraints."""
    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("file_path", sa.String(length=512), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("visibility", sa.String(length=7), server_default="private", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.CheckConstraint("visibility IN ('public', 'private')", name="ck_media_visibility"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_media_owner_id", "media", ["owner_id"], unique=False)


def downgrade() -> None:
    """Remove the media table and its owner index."""
    op.drop_index("ix_media_owner_id", table_name="media")
    op.drop_table("media")
