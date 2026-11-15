import asyncio
import logging
import re
from contextlib import asynccontextmanager
from datetime import datetime
from urllib.request import urlopen
from xml.etree import ElementTree as ET

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import engine
from .models import YouTubeVideo

CHANNEL_ID = "UCBKc-rPDivvwFiWdG-81wxw"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
NAMESPACES = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}
MAX_FEED_BYTES = 256 * 1024
VIDEO_ID = re.compile(r"[A-Za-z0-9_-]{11}")
logger = logging.getLogger(__name__)


def read_videos(body: bytes) -> list[dict]:
    if len(body) > MAX_FEED_BYTES:
        raise ValueError("Feed muito grande.")
    xml = body.decode("utf-8-sig")
    if "<!DOCTYPE" in xml:
        raise ValueError("Feed inválido.")
    feed = ET.fromstring(xml)
    if feed.tag != f"{{{NAMESPACES['atom']}}}feed":
        raise ValueError("Feed Atom inválido.")

    videos = []
    for entry in feed.findall("atom:entry", NAMESPACES):
        channel = entry.findtext("yt:channelId", "", NAMESPACES)
        if channel != CHANNEL_ID:
            continue
        video_id = entry.findtext("yt:videoId", "", NAMESPACES)
        title = entry.findtext("atom:title", "", NAMESPACES).strip()
        if not VIDEO_ID.fullmatch(video_id) or not title:
            raise ValueError("Vídeo inválido.")
        published_at = datetime.fromisoformat(entry.findtext("atom:published", "", NAMESPACES))
        updated_at = datetime.fromisoformat(
            entry.findtext("atom:updated", published_at.isoformat(), NAMESPACES)
        )
        if published_at.tzinfo is None or updated_at.tzinfo is None:
            raise ValueError("Data sem fuso horário.")
        videos.append(
            {
                "id": video_id,
                "title": title[:250],
                "published_at": published_at,
                "updated_at": updated_at,
            }
        )
    return videos


def save_videos(videos: list[dict]) -> None:
    with Session(engine) as db:
        # Ordering locks by ID also keeps feed imports and concurrent deliveries consistent.
        for video in sorted(videos, key=lambda item: item["id"]):
            statement = insert(YouTubeVideo).values(video)
            db.execute(
                statement.on_conflict_do_update(
                    index_elements=[YouTubeVideo.id],
                    set_={
                        "title": statement.excluded.title,
                        "updated_at": statement.excluded.updated_at,
                    },
                    where=statement.excluded.updated_at > YouTubeVideo.updated_at,
                )
            )
        db.commit()


def import_feed() -> None:
    with urlopen(FEED_URL, timeout=10) as response:
        videos = read_videos(response.read(MAX_FEED_BYTES + 1))
    if videos:
        save_videos(videos)


async def sync_feed() -> None:
    while True:
        try:
            await asyncio.to_thread(import_feed)
        except (OSError, ValueError, ET.ParseError, SQLAlchemyError) as error:
            logger.warning("Falha ao atualizar feed da TV Palmeiras (%s).", type(error).__name__)
        await asyncio.sleep(30 * 60)


@asynccontextmanager
async def youtube_lifespan(app):
    task = asyncio.create_task(sync_feed())
    try:
        yield
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
