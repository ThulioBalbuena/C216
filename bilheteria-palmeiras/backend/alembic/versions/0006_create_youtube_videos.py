"""Store videos from the official Palmeiras YouTube channel."""

from datetime import datetime

import sqlalchemy as sa

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    videos = op.create_table(
        "youtube_videos",
        sa.Column("id", sa.String(11), primary_key=True),
        sa.Column("title", sa.String(250), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_youtube_videos_published_at", "youtube_videos", ["published_at"])
    initial_videos = [
        (
            "4ySyRXZpK3I",
            "BASTIDORES CIMED | SANTOS 0 X 3 PALMEIRAS | VIRADA HISTÓRICA | SEMIFINAL PAULISTA SUB-20 2026",
            datetime.fromisoformat("2026-11-14T22:00:10Z"),
        ),
        (
            "cVfBlO3Js1Q",
            "ALEXANDER BARBOZA | PALMEIRAS CAST #212",
            datetime.fromisoformat("2026-11-13T21:00:08Z"),
        ),
        (
            "fD0RFC3smPw",
            "EVANGELISTA RECEBE RECADO ESPECIAL NO TREINO DO PALMEIRAS 💚",
            datetime.fromisoformat("2026-11-13T19:00:21Z"),
        ),
    ]
    op.bulk_insert(
        videos,
        [
            {"id": video_id, "title": title, "published_at": published, "updated_at": published}
            for video_id, title, published in initial_videos
        ],
    )


def downgrade():
    op.drop_index("ix_youtube_videos_published_at", table_name="youtube_videos")
    op.drop_table("youtube_videos")
