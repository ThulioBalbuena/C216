from threading import Lock

from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate


class ItemNotFoundError(Exception):
    """O item solicitado não existe."""


class ItemService:
    """Armazena itens em memória durante a execução do processo."""

    def __init__(self) -> None:
        self._items: dict[int, ItemResponse] = {}
        self._next_id = 1
        self._lock = Lock()

    def list_items(
        self, skip: int = 0, limit: int = 20, q: str | None = None
    ) -> list[ItemResponse]:
        with self._lock:
            items = self._items.values()
            matches = [
                item.model_copy()
                for item in items
                if q is None or q.casefold() in item.name.casefold()
            ]
            return matches[skip : skip + limit]

    def get_item(self, item_id: int) -> ItemResponse:
        with self._lock:
            return self._get_item(item_id).model_copy()

    def _get_item(self, item_id: int) -> ItemResponse:
        if item_id not in self._items:
            raise ItemNotFoundError(item_id)
        return self._items[item_id]

    def create_item(self, data: ItemCreate) -> ItemResponse:
        with self._lock:
            item = ItemResponse(id=self._next_id, **data.model_dump())
            self._items[item.id] = item
            self._next_id += 1
            return item.model_copy()

    def replace_item(self, item_id: int, data: ItemCreate) -> ItemResponse:
        with self._lock:
            self._get_item(item_id)
            item = ItemResponse(id=item_id, **data.model_dump())
            self._items[item_id] = item
            return item.model_copy()

    def update_item(self, item_id: int, data: ItemUpdate) -> ItemResponse:
        with self._lock:
            current = self._get_item(item_id)
            item = ItemResponse.model_validate(
                current.model_dump() | data.model_dump(exclude_unset=True)
            )
            self._items[item_id] = item
            return item.model_copy()

    def delete_item(self, item_id: int) -> None:
        with self._lock:
            self._get_item(item_id)
            del self._items[item_id]
