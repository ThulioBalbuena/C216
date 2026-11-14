from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import repositories
from .models import Sector, Simulation
from .schemas import SimulationInput, SimulationOut


def serialize(draft: Simulation):
    sector = draft.sector
    return SimulationOut(
        id=draft.id,
        match=sector.match,
        sector=sector,
        quantity=draft.quantity,
        unit_price_cents=sector.price_cents,
        total_cents=sector.price_cents * draft.quantity,
    )


def get_draft(db: Session, browser_id: UUID, draft_id: UUID, *, lock: bool = False):
    draft = repositories.get_simulation(db, browser_id, draft_id, lock=lock)
    if draft is None:
        raise HTTPException(404, "Pedido não encontrado.")
    return draft


def selected_sector(db: Session, data: SimulationInput):
    sector = db.get(Sector, data.sector_id)
    if sector is None:
        raise HTTPException(404, "Setor não encontrado.")
    if sector.remaining < data.quantity:
        raise HTTPException(409, "Vagas insuficientes no setor. Ajuste sua escolha.")
    return sector


def create_draft(db: Session, browser_id: UUID, data: SimulationInput):
    draft = Simulation(
        browser_id=browser_id, sector=selected_sector(db, data), quantity=data.quantity
    )
    db.add(draft)
    db.flush()
    result = serialize(draft)
    db.commit()
    return result


def update_draft(db: Session, browser_id: UUID, draft_id: UUID, data: SimulationInput):
    draft = get_draft(db, browser_id, draft_id, lock=True)
    sector = selected_sector(db, data)
    if sector.match_id != draft.sector.match_id:
        raise HTTPException(422, "Escolha um setor da mesma partida.")
    draft.sector = sector
    draft.quantity = data.quantity
    result = serialize(draft)
    db.commit()
    return result


def delete_draft(db: Session, browser_id: UUID, draft_id: UUID):
    draft = get_draft(db, browser_id, draft_id, lock=True)
    db.delete(draft)
    db.commit()
