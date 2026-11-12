import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from .database import engine

app = FastAPI(title="Bilheteria Palmeiras", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET"],
    allow_headers=[],
)


@app.get("/api/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(select(1))
    except SQLAlchemyError:
        raise HTTPException(503, "Banco de dados indisponível.") from None

    return {"status": "ok"}
