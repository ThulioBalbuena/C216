from collections.abc import Iterator

import pytest
from app.main import create_app
from app.services.items import ItemService
from fastapi.testclient import TestClient


@pytest.fixture
def service() -> ItemService:
    return ItemService()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client
