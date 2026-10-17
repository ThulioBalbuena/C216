from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.items import ItemService

router = APIRouter(prefix="/items", tags=["items"])


def get_item_service(db: Annotated[Session, Depends(get_session)]) -> ItemService:
    return ItemService(ItemRepository(db))


Service = Annotated[ItemService, Depends(get_item_service)]
ItemId = Annotated[int, Path(gt=0, description="Identificador do item")]


@router.get("", response_model=list[ItemResponse])
def list_items(
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
) -> list[ItemResponse]:
    return service.list_items(skip=skip, limit=limit, q=q)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: ItemId, service: Service) -> ItemResponse:
    return service.get_item(item_id)


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(data: ItemCreate, service: Service) -> ItemResponse:
    return service.create_item(data)


@router.put("/{item_id}", response_model=ItemResponse)
def replace_item(item_id: ItemId, data: ItemCreate, service: Service) -> ItemResponse:
    return service.replace_item(item_id, data)


@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(item_id: ItemId, data: ItemUpdate, service: Service) -> ItemResponse:
    return service.update_item(item_id, data)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: ItemId, service: Service) -> Response:
    service.delete_item(item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
