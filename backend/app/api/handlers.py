from fastapi import Request
from fastapi.responses import JSONResponse

from app.services.items import ItemNotFoundError


async def item_not_found_handler(
    request: Request, exc: ItemNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "Item não encontrado"})
