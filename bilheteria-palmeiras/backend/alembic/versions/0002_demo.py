"""Populate the fictitious match and sector catalog."""

from datetime import datetime

import sqlalchemy as sa

from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade():
    matches = sa.table(
        "matches",
        sa.column("id", sa.Integer),
        sa.column("opponent", sa.String),
        sa.column("competition", sa.String),
        sa.column("venue", sa.String),
        sa.column("starts_at", sa.DateTime(timezone=True)),
        sa.column("opponent_initials", sa.String),
    )
    sectors = sa.table(
        "sectors",
        sa.column("id", sa.Integer),
        sa.column("match_id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
        sa.column("price_cents", sa.Integer),
        sa.column("remaining", sa.Integer),
    )
    fixtures = [
        (1, "Santos", "SAN", "2026-11-21T18:30:00-03:00"),
        (2, "Bahia", "BAH", "2026-11-29T16:00:00-03:00"),
        (3, "Grêmio", "GRE", "2026-12-06T18:30:00-03:00"),
    ]
    op.bulk_insert(
        matches,
        [
            {
                "id": match_id,
                "opponent": opponent,
                "opponent_initials": initials,
                "starts_at": datetime.fromisoformat(date),
                "venue": "Nubank Parque · São Paulo, SP",
                "competition": "Brasileirão",
            }
            for match_id, opponent, initials, date in fixtures
        ],
    )
    zones = [
        ("Gol Norte", "Atrás do gol, perto da torcida", 8000),
        ("Central Leste", "Vista lateral, próxima ao campo", 12000),
        ("Gol Sul", "Vista atrás do gol", 7500),
        ("Superior Oeste", "Vista panorâmica do gramado", 9500),
    ]
    stock = [(24, 8, 0, 42), (16, 4, 12, 28), (8, 12, 5, 0)]
    op.bulk_insert(
        sectors,
        [
            {
                "id": (match_id - 1) * len(zones) + index + 1,
                "match_id": match_id,
                "name": name,
                "description": description,
                "price_cents": price,
                "remaining": stock[match_id - 1][index],
            }
            for match_id, *_ in fixtures
            for index, (name, description, price) in enumerate(zones)
        ],
    )

    op.execute(
        "SELECT setval(pg_get_serial_sequence('matches', 'id'), (SELECT max(id) FROM matches))"
    )
    op.execute(
        "SELECT setval(pg_get_serial_sequence('sectors', 'id'), (SELECT max(id) FROM sectors))"
    )


def downgrade():
    op.execute("DELETE FROM sectors WHERE id BETWEEN 1 AND 12")
    op.execute("DELETE FROM matches WHERE id BETWEEN 1 AND 3")
