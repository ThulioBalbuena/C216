from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    """Informa se a API está disponível."""
    return {"status": "ok"}
