from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
