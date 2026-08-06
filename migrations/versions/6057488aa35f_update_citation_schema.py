"""update citation schema

Revision ID: 6057488aa35f
Revises: 5fc957b675ca
Create Date: 2026-08-04 22:19:06.726302

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6057488aa35f'
down_revision: Union[str, Sequence[str], None] = '5fc957b675ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        "citations",
        "citing_title",
        new_column_name="title",
    )

    op.alter_column(
        "citations",
        "citing_authors",
        new_column_name="authors",
    )

    op.alter_column(
        "citations",
        "citation_type",
        new_column_name="citation_style",
    )

    op.add_column(
        "citations",
        sa.Column("volume", sa.String(50), nullable=True)
    )

    op.add_column(
        "citations",
        sa.Column("issue", sa.String(50), nullable=True)
    )

    op.add_column(
        "citations",
        sa.Column("pages", sa.String(50), nullable=True)
    )

    op.add_column(
        "citations",
        sa.Column("formatted_citation", sa.Text(), nullable=True)
    )


def downgrade():

    op.drop_column("citations", "formatted_citation")
    op.drop_column("citations", "pages")
    op.drop_column("citations", "issue")
    op.drop_column("citations", "volume")

    op.alter_column(
        "citations",
        "citation_style",
        new_column_name="citation_type",
    )

    op.alter_column(
        "citations",
        "authors",
        new_column_name="citing_authors",
    )

    op.alter_column(
        "citations",
        "title",
        new_column_name="citing_title",
    )
