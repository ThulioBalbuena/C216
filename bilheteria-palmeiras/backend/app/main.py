import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from .database import engine
from .routes import router
from .youtube import youtube_lifespan

app = FastAPI(title="Bilheteria Palmeiras", version="0.1.0", lifespan=youtube_lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Browser-ID"],
)
app.include_router(router)


@app.get("/api/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(select(1))
    except SQLAlchemyError:
        raise HTTPException(503, "Banco de dados indisponível.") from None

    return {"status": "ok"}
