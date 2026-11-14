from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from .models import Match, Sector, Simulation


def list_matches(db: Session):
    return db.scalars(select(Match).order_by(Match.starts_at, Match.id)).all()


def get_match(db: Session, match_id: int):
    return db.get(Match, match_id, options=[selectinload(Match.sectors)])


def list_simulations(db: Session, browser_id: UUID):
    return db.scalars(
        select(Simulation)
        .options(joinedload(Simulation.sector).joinedload(Sector.match))
        .where(Simulation.browser_id == browser_id)
        .order_by(Simulation.created_at.desc(), Simulation.id)
    ).all()


def get_simulation(db: Session, browser_id: UUID, draft_id: UUID, *, lock: bool = False):
    query = select(Simulation).where(Simulation.id == draft_id, Simulation.browser_id == browser_id)
    return db.scalar(query.with_for_update() if lock else query)
