from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import repositories
from .database import get_db
from .schemas import MatchDetail, MatchOut

router = APIRouter(prefix="/api")
Db = Annotated[Session, Depends(get_db)]


@router.get("/matches", response_model=list[MatchOut])
def list_matches(db: Db):
    return repositories.list_matches(db)


@router.get("/matches/{match_id}", response_model=MatchDetail)
def match_detail(match_id: int, db: Db):
    match = repositories.get_match(db, match_id)
    if match is None:
        raise HTTPException(404, "Partida não encontrada.")
    return match
