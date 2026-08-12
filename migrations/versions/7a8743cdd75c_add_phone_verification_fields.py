"""add phone verification fields

Revision ID: 7a8743cdd75c
Revises: fbd9db72b291
Create Date: 2026-08-12 13:59:28.685089

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "7a8743cdd75c"
down_revision: Union[str, Sequence[str], None] = "fbd9db72b291"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "users",
        sa.Column(
            "phone_number",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "phone_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "phone_verification_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_phone_number",
        "users",
        ["phone_number"],
        unique=True,
    )

    # Remove the database-level default after existing rows
    # have been populated with False.
    op.alter_column(
        "users",
        "phone_verified",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_users_phone_number",
        table_name="users",
    )

    op.drop_column(
        "users",
        "phone_verification_at",
    )

    op.drop_column(
        "users",
        "phone_verified",
    )

    op.drop_column(
        "users",
        "phone_number",
    )