import pytest

from app.schemas.item import ItemCreate, ItemUpdate
from app.services.items import ItemNotFoundError, ItemService


def test_create_and_get_item(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Caderno", price=10))

    assert item.model_dump() == {
        "id": 1,
        "name": "Caderno",
        "price": 10,
        "description": None,
    }
    assert service.get_item(item.id) == item


def test_list_filters_before_pagination(service: ItemService) -> None:
    assert service.list_items() == []
    for name in ["Caneta azul", "Caderno", "Caneta preta"]:
        service.create_item(ItemCreate(name=name, price=5))

    assert [item.id for item in service.list_items(q="CANETA", skip=1, limit=1)] == [3]
    assert service.list_items(skip=10) == []
    assert service.list_items(q="inexistente") == []


def test_replace_resets_omitted_optional_fields(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Antigo", price=10, description="Texto"))
    replaced = service.replace_item(item.id, ItemCreate(name="Novo", price=20))

    assert replaced.model_dump() == {
        "id": item.id,
        "name": "Novo",
        "price": 20,
        "description": None,
    }
    assert service.get_item(item.id) == replaced


def test_patch_preserves_omitted_fields_and_accepts_null_description(
    service: ItemService,
) -> None:
    item = service.create_item(
        ItemCreate(name="Caderno", price=10, description="Texto")
    )
    updated = service.update_item(item.id, ItemUpdate(price=0))
    assert updated.model_dump() == {
        "id": item.id,
        "name": "Caderno",
        "price": 0,
        "description": "Texto",
    }
    assert service.update_item(item.id, ItemUpdate()) == updated
    cleared = service.update_item(item.id, ItemUpdate(description=None))
    assert cleared.description is None
    assert service.get_item(item.id) == cleared


def test_delete_does_not_reuse_ids(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Caderno", price=10))
    service.delete_item(item.id)
    assert service.list_items() == []
    with pytest.raises(ItemNotFoundError):
        service.get_item(item.id)
    assert service.create_item(ItemCreate(name="Caneta", price=5)).id > item.id


@pytest.mark.parametrize("operation", ["get", "replace", "update", "delete"])
def test_missing_item_raises_domain_error(service: ItemService, operation: str) -> None:
    with pytest.raises(ItemNotFoundError):
        if operation == "get":
            service.get_item(999)
        elif operation == "replace":
            service.replace_item(999, ItemCreate(name="Novo", price=20))
        elif operation == "update":
            service.update_item(999, ItemUpdate(price=20))
        else:
            service.delete_item(999)
    assert service.list_items() == []


def test_returned_objects_cannot_mutate_storage(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Caderno", price=10))
    item.name = "Alterado"
    service.get_item(item.id).name = "Alterado"
    service.list_items()[0].name = "Alterado"
    assert service.get_item(item.id).name == "Caderno"
