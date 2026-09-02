from fastapi import FastAPI

app = FastAPI(title="C216 API")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Informa se a API está disponível."""
    return {"status": "ok"}
