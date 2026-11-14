"""Require unique item names."""

from alembic import op

revision = "749b0a15e63c"
down_revision = "d226132ee01d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint("uq_items_name", "items", ["name"])


def downgrade() -> None:
    op.drop_constraint("uq_items_name", "items", type_="unique")
