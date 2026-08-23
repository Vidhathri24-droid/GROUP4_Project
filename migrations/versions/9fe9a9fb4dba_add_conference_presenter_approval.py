"""add conference presenter approval

Revision ID: 9fe9a9fb4dba
Revises: 59abebec8d2
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9fe9a9fb4dba"
down_revision: Union[str, Sequence[str], None] = "59abebec8d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ---------------------------------------------------------
    # Conference registrations
    # ---------------------------------------------------------

    op.add_column(
        "conference_registrations",
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="Approved",
        ),
    )

    op.add_column(
        "conference_registrations",
        sa.Column(
            "reminder_sent_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # ---------------------------------------------------------
    # Conference creator
    # ---------------------------------------------------------

    op.add_column(
        "conferences",
        sa.Column(
            "created_by",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_conferences_created_by",
        "conferences",
        ["created_by"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_conferences_created_by_users",
        "conferences",
        "users",
        ["created_by"],
        ["id"],
        ondelete="SET NULL",
    )

    # Remove server default after existing rows are populated
    op.alter_column(
        "conference_registrations",
        "status",
        server_default=None,
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_conferences_created_by_users",
        "conferences",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_conferences_created_by",
        table_name="conferences",
    )

    op.drop_column(
        "conferences",
        "created_by",
    )

    op.drop_column(
        "conference_registrations",
        "reminder_sent_at",
    )

    op.drop_column(
        "conference_registrations",
        "status",
    )