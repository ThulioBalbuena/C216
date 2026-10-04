from fastapi import FastAPI

from app.api.handlers import item_not_found_handler
from app.api.routes import health, items
from app.services.items import ItemNotFoundError, ItemService


def create_app() -> FastAPI:
    app = FastAPI(title="C216 API")
    app.state.item_service = ItemService()
    app.add_exception_handler(ItemNotFoundError, item_not_found_handler)
    app.include_router(health.router)
    app.include_router(items.router)
    return app


app = create_app()
