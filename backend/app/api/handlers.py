from fastapi import Request
from fastapi.responses import JSONResponse

from app.repositories.item import ItemNameConflictError
from app.services.items import ItemNotFoundError


async def item_not_found_handler(
    request: Request, exc: ItemNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "Item não encontrado"})


async def item_name_conflict_handler(
    request: Request, exc: ItemNameConflictError
) -> JSONResponse:
    return JSONResponse(
        status_code=409, content={"detail": "Já existe um item com esse nome"}
    )
