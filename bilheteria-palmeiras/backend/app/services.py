from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import repositories
from .models import Sector, Simulation
from .schemas import SimulationInput, SimulationOut


def serialize(draft: Simulation):
    sector = draft.sector
    price = draft.confirmed_price_cents or sector.price_cents
    return SimulationOut(
        id=draft.id,
        match=sector.match,
        sector=sector,
        quantity=draft.quantity,
        unit_price_cents=price,
        total_cents=price * draft.quantity,
        confirmed_at=draft.confirmed_at,
        code=f"BP-{draft.id.hex.upper()}" if draft.confirmed_at else None,
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
    require_available(sector, data.quantity)
    return sector


def require_available(sector: Sector, quantity: int):
    if sector.remaining < quantity:
        raise HTTPException(409, "Vagas insuficientes no setor. Ajuste sua escolha.")


def require_draft(order: Simulation):
    if order.confirmed_at is not None:
        raise HTTPException(409, "O pedido já foi confirmado.")


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
    require_draft(draft)
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
    require_draft(draft)
    db.delete(draft)
    db.commit()


def confirm_order(db: Session, browser_id: UUID, draft_id: UUID):
    order = get_draft(db, browser_id, draft_id, lock=True)
    if order.confirmed_at is not None:
        return serialize(order)

    sector = db.get(Sector, order.sector_id, with_for_update=True)
    require_available(sector, order.quantity)
    sector.remaining -= order.quantity
    order.confirmed_price_cents = sector.price_cents
    order.confirmed_at = datetime.now(UTC)
    result = serialize(order)
    db.commit()
    return result
