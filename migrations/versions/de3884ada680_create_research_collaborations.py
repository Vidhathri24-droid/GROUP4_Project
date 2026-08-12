"""create research collaborations

Revision ID: de3884ada680
Revises: 6057488aa35f
Create Date: 2026-08-06 14:08:55.630348

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "de3884ada680"

down_revision: Union[str, Sequence[str], None] = "6057488aa35f"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create research collaborations table."""

    op.create_table(
        "research_collaborations",

        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "researcher1_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "researcher2_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "publication_id",
            sa.UUID(),
            nullable=True,
        ),

        sa.Column(
            "collaboration_type",
            sa.Enum(
                "COAUTHOR",
                "PROJECT",
                "SUPERVISION",
                "FUNDING",
                "OTHER",
                name="collaborationtype",
            ),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE",
                "COMPLETED",
                "PENDING",
                name="collaborationstatus",
            ),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.String(length=1000),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["publication_id"],
            ["publications.id"],
            ondelete="SET NULL",
        ),

        sa.ForeignKeyConstraint(
            ["researcher1_id"],
            ["researchers.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["researcher2_id"],
            ["researchers.id"],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop research collaborations table."""

    op.drop_table("research_collaborations")