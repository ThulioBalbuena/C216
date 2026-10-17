from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item


class ItemRepository:
    """Centraliza a persistência dos itens no banco."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, name: str, price: float, description: str | None = None) -> Item:
        item = Item(name=name, price=price, description=description)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

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
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        self.db.delete(item)
        self.db.commit()
