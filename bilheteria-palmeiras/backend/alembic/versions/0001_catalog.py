"""Create the match and sector tables."""

import sqlalchemy as sa

from alembic import op

revision = "0001"
down_revision = None


def upgrade():
    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("opponent", sa.String(60), nullable=False),
        sa.Column("competition", sa.String(60), nullable=False),
        sa.Column("venue", sa.String(100), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("opponent_initials", sa.String(3), nullable=False),
    )
    op.create_table(
        "sectors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("match_id", sa.Integer(), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("description", sa.String(150), nullable=False),
        sa.Column("price_cents", sa.Integer(), nullable=False),
        sa.Column("remaining", sa.Integer(), nullable=False),
        sa.CheckConstraint("remaining >= 0"),
        sa.CheckConstraint("price_cents > 0"),
    )
    op.create_index("ix_sectors_match_id", "sectors", ["match_id"])


def downgrade():
    op.drop_table("sectors")
    op.drop_table("matches")
