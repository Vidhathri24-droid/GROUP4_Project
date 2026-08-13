"""add username and otp fields

Revision ID: 59abebec8d2
Revises: 7a8743cdd75c
Create Date: 2026-08-13 03:51:16.289927

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "59abebec8d2"

down_revision: Union[str, Sequence[str], None] = "7a8743cdd75c"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ---------------------------------------------------------
    # Username
    # ---------------------------------------------------------

    # Add temporarily as nullable because existing users
    # already exist in the database.
    op.add_column(
        "users",
        sa.Column(
            "username",
            sa.String(length=50),
            nullable=True,
        ),
    )

    # Give existing users a safe temporary username.
    #
    # Example:
    # user_7f3a91c2b4d1
    #
    # The UUID makes it unique.
    op.execute(
        """
        UPDATE users
        SET username =
            'user_' ||
            substring(
                replace(id::text, '-', ''),
                1,
                12
            )
        WHERE username IS NULL
        """
    )

    # Username is now populated for all existing users.
    op.alter_column(
        "users",
        "username",
        nullable=False,
    )

    # Unique username.
    op.create_unique_constraint(
        "uq_user_username",
        "users",
        ["username"],
    )

    # ---------------------------------------------------------
    # Email OTP
    # ---------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "email_otp",
            sa.String(length=6),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "email_otp_expiry",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # ---------------------------------------------------------
    # Phone OTP
    # ---------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "phone_otp",
            sa.String(length=6),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "phone_otp_expiry",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "users",
        "phone_otp_expiry",
    )

    op.drop_column(
        "users",
        "phone_otp",
    )

    op.drop_column(
        "users",
        "email_otp_expiry",
    )

    op.drop_column(
        "users",
        "email_otp",
    )

    op.drop_constraint(
        "uq_user_username",
        "users",
        type_="unique",
    )

    op.drop_column(
        "users",
        "username",
    )