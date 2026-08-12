"""merge collaboration migration heads

Revision ID: fbd9db72b291
Revises: 3b37878047c4, de3884ada680
Create Date: 2026-08-12 13:45:20.430395

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fbd9db72b291'
down_revision: Union[str, Sequence[str], None] = ('3b37878047c4', 'de3884ada680')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
