from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from . import repositories, services
from .database import get_db
from .schemas import MatchDetail, MatchOut, SimulationInput, SimulationOut

router = APIRouter(prefix="/api")
Db = Annotated[Session, Depends(get_db)]
Browser = Annotated[UUID, Header(alias="X-Browser-ID")]


@router.get("/matches", response_model=list[MatchOut])
def list_matches(db: Db):
    return repositories.list_matches(db)


@router.get("/matches/{match_id}", response_model=MatchDetail)
def match_detail(match_id: int, db: Db):
    match = repositories.get_match(db, match_id)
    if match is None:
        raise HTTPException(404, "Partida não encontrada.")
    return match


@router.get("/simulations", response_model=list[SimulationOut])
def list_simulations(db: Db, browser: Browser):
    return [services.serialize(draft) for draft in repositories.list_simulations(db, browser)]


@router.post("/simulations", status_code=201, response_model=SimulationOut)
def create_simulation(data: SimulationInput, db: Db, browser: Browser):
    return services.create_draft(db, browser, data)


@router.get("/simulations/{draft_id}", response_model=SimulationOut)
def get_simulation(draft_id: UUID, db: Db, browser: Browser):
    return services.serialize(services.get_draft(db, browser, draft_id))


@router.put("/simulations/{draft_id}", response_model=SimulationOut)
def update_simulation(draft_id: UUID, data: SimulationInput, db: Db, browser: Browser):
    return services.update_draft(db, browser, draft_id, data)


@router.delete("/simulations/{draft_id}", status_code=204)
def delete_simulation(draft_id: UUID, db: Db, browser: Browser):
    services.delete_draft(db, browser, draft_id)
    return Response(status_code=204)
