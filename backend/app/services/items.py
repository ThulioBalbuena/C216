from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate


class ItemNotFoundError(Exception):
    """O item solicitado não existe."""


class ItemService:
    def __init__(self, repository: ItemRepository) -> None:
        self.repository = repository

    def list_items(
        self, skip: int = 0, limit: int = 20, q: str | None = None
    ) -> list[ItemResponse]:
        return [
            ItemResponse.model_validate(item)
            for item in self.repository.get_all(skip=skip, limit=limit, q=q)
        ]

    def get_item(self, item_id: int) -> ItemResponse:
        return ItemResponse.model_validate(self._get_item(item_id))

    def _get_item(self, item_id: int) -> Item:
        item = self.repository.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundError(item_id)
        return item

    def create_item(self, data: ItemCreate) -> ItemResponse:
        item = self.repository.create(**data.model_dump())
        return ItemResponse.model_validate(item)

    def replace_item(self, item_id: int, data: ItemCreate) -> ItemResponse:
        item = self.repository.update(self._get_item(item_id), data.model_dump())
        return ItemResponse.model_validate(item)

    def update_item(self, item_id: int, data: ItemUpdate) -> ItemResponse:
        item = self.repository.update(
            self._get_item(item_id), data.model_dump(exclude_unset=True)
        )
        return ItemResponse.model_validate(item)

    def delete_item(self, item_id: int) -> None:
        self.repository.delete(self._get_item(item_id))
