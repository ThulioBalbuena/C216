import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.handlers import item_name_conflict_handler, item_not_found_handler
from app.api.routes import health, items
from app.repositories.item import ItemNameConflictError
from app.services.items import ItemNotFoundError


def create_app() -> FastAPI:
    app = FastAPI(title="C216 API")
    origins = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            origin.strip()
            for origin in origins.split(",")
            if origin.strip() and origin.strip() != "*"
        ],
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )
    app.add_exception_handler(ItemNotFoundError, item_not_found_handler)
    app.add_exception_handler(ItemNameConflictError, item_name_conflict_handler)
    app.include_router(health.router)
    app.include_router(items.router)
    return app


app = create_app()
