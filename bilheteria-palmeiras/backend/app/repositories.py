from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .models import Match


def list_matches(db: Session):
    return db.scalars(select(Match).order_by(Match.starts_at, Match.id)).all()


def get_match(db: Session, match_id: int):
    return db.get(Match, match_id, options=[selectinload(Match.sectors)])
