from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    opponent: Mapped[str] = mapped_column(String(60))
    competition: Mapped[str] = mapped_column(String(60))
    venue: Mapped[str] = mapped_column(String(100))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    opponent_initials: Mapped[str] = mapped_column(String(3))
    sectors: Mapped[list["Sector"]] = relationship(back_populates="match", order_by="Sector.id")


class Sector(Base):
    __tablename__ = "sectors"
    __table_args__ = (
        CheckConstraint("remaining >= 0"),
        CheckConstraint("price_cents > 0"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), index=True)
    name: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(String(150))
    price_cents: Mapped[int]
    remaining: Mapped[int]
    match: Mapped[Match] = relationship(back_populates="sectors")


class Simulation(Base):
    __tablename__ = "simulations"
    __table_args__ = (CheckConstraint("quantity BETWEEN 1 AND 4"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    browser_id: Mapped[UUID] = mapped_column(Uuid, index=True)
    sector_id: Mapped[int] = mapped_column(ForeignKey("sectors.id"))
    quantity: Mapped[int]
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirmed_price_cents: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    sector: Mapped[Sector] = relationship()
