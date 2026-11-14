from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.item import Item


class ItemNameConflictError(Exception):
    """Já existe um item com esse nome."""


class ItemRepository:
    """Centraliza a persistência dos itens no banco."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def _commit_item(self, item: Item) -> Item:
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
            if constraint == "uq_items_name" or str(exc.orig) == (
                "UNIQUE constraint failed: items.name"
            ):
                raise ItemNameConflictError from exc
            raise
        self.db.refresh(item)
        return item

    def create(self, name: str, price: float, description: str | None = None) -> Item:
        item = Item(name=name, price=price, description=description)
        self.db.add(item)
        return self._commit_item(item)

    def get_by_id(self, item_id: int) -> Item | None:
        return self.db.get(Item, item_id)

    def get_all(
        self, skip: int = 0, limit: int = 20, q: str | None = None
    ) -> list[Item]:
        statement = select(Item)
        if q is not None:
            statement = statement.where(Item.name.icontains(q, autoescape=True))
        statement = statement.order_by(Item.id).offset(skip).limit(limit)
        return list(self.db.scalars(statement))

    def update(self, item: Item, changes: dict) -> Item:
        for field, value in changes.items():
            setattr(item, field, value)
        return self._commit_item(item)

    def delete(self, item: Item) -> None:
        self.db.delete(item)
        self.db.commit()
