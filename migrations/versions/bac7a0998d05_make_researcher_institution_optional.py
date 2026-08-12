"""make researcher institution optional

Revision ID: bac7a0998d05
Revises: 3b37878047c4
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "bac7a0998d05"
down_revision: Union[str, Sequence[str], None] = "3b37878047c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ---------------------------------------------------------
    # 1. Convert invalid/empty experience values to 0
    # ---------------------------------------------------------
    op.execute(
        """
        UPDATE researchers
        SET experience = '0'
        WHERE experience IS NULL
           OR TRIM(experience) = ''
           OR TRIM(experience) !~ '^[0-9]+$'
        """
    )

    # ---------------------------------------------------------
    # 2. Convert experience VARCHAR -> INTEGER
    # ---------------------------------------------------------
    op.execute(
        """
        ALTER TABLE researchers
        ALTER COLUMN experience TYPE INTEGER
        USING experience::integer
        """
    )

    # ---------------------------------------------------------
    # 3. Make experience NOT NULL
    # ---------------------------------------------------------
    op.alter_column(
        "researchers",
        "experience",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # ---------------------------------------------------------
    # 4. Make institution_id optional
    # ---------------------------------------------------------
    op.alter_column(
        "researchers",
        "institution_id",
        existing_type=sa.UUID(),
        nullable=True,
    )


def downgrade() -> None:

    # ---------------------------------------------------------
    # 1. Convert experience INTEGER -> VARCHAR
    # ---------------------------------------------------------
    op.execute(
        """
        ALTER TABLE researchers
        ALTER COLUMN experience TYPE VARCHAR(100)
        USING experience::varchar
        """
    )

    # ---------------------------------------------------------
    # 2. Allow experience to be NULL
    # ---------------------------------------------------------
    op.alter_column(
        "researchers",
        "experience",
        existing_type=sa.VARCHAR(length=100),
        nullable=True,
    )

    # ---------------------------------------------------------
    # 3. Make institution_id NOT NULL again
    # ---------------------------------------------------------
    op.alter_column(
        "researchers",
        "institution_id",
        existing_type=sa.UUID(),
        nullable=False,
    )