"""Store the confirmation date and price of ticket orders."""

import sqlalchemy as sa

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("simulations", sa.Column("confirmed_at", sa.DateTime(timezone=True)))
    op.add_column("simulations", sa.Column("confirmed_price_cents", sa.Integer()))


def downgrade():
    op.drop_column("simulations", "confirmed_price_cents")
    op.drop_column("simulations", "confirmed_at")
