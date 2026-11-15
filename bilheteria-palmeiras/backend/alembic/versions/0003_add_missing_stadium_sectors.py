"""Add missing stadium sectors."""

import sqlalchemy as sa

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

sectors = sa.table(
    "sectors",
    sa.column("match_id", sa.Integer),
    sa.column("name", sa.String),
    sa.column("description", sa.String),
    sa.column("price_cents", sa.Integer),
    sa.column("remaining", sa.Integer),
)
matches = sa.table("matches", sa.column("id", sa.Integer))
demo_matches = (1, 2, 3)
new_sectors = (
    ("Central Oeste", "Vista lateral pelo lado oeste", 14000, 16),
    ("Superior Norte", "Vista elevada atrás do gol norte", 9000, 22),
    ("Superior Sul", "Vista elevada atrás do gol sul", 9000, 24),
    ("Superior Leste", "Vista panorâmica pelo lado leste", 9500, 30),
)


def upgrade():
    for name, description, price, remaining in new_sectors:
        op.execute(
            sectors.insert().from_select(
                ["match_id", "name", "description", "price_cents", "remaining"],
                sa.select(
                    matches.c.id,
                    sa.literal(name),
                    sa.literal(description),
                    sa.literal(price),
                    sa.literal(remaining),
                ).where(matches.c.id.in_(demo_matches)),
            )
        )


def downgrade():
    names = [name for name, *_ in new_sectors]
    op.execute(
        sectors.delete().where(sectors.c.match_id.in_(demo_matches), sectors.c.name.in_(names))
    )
