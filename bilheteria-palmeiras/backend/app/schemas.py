from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    opponent: str
    competition: str
    venue: str
    starts_at: datetime
    opponent_initials: str


class SectorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    price_cents: int
    remaining: int


class MatchDetail(MatchOut):
    sectors: list[SectorOut]


class SimulationInput(BaseModel):
    sector_id: int = Field(gt=0, strict=True)
    quantity: int = Field(ge=1, le=4, strict=True)


class SimulationOut(BaseModel):
    id: UUID
    match: MatchOut
    sector: SectorOut
    quantity: int
    unit_price_cents: int
    total_cents: int
