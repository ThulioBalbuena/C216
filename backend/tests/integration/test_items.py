import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine


def test_complete_item_lifecycle(client: TestClient) -> None:
    assert client.get("/items").json() == []
    response = client.post(
        "/items", json={"name": "Caderno", "price": 10, "description": "Azul"}
    )
    assert response.status_code == 201
    item = response.json()
    assert item == {"id": 1, "name": "Caderno", "price": 10, "description": "Azul"}
    path = f"/items/{item['id']}"
    response = client.get(path)
    assert response.status_code == 200
    assert response.json() == item
    assert client.get("/items").json() == [item]

    response = client.put(path, json={"name": "Caneta", "price": 5})
    assert response.status_code == 200
    assert response.json() == {
        "id": item["id"],
        "name": "Caneta",
        "price": 5,
        "description": None,
    }
    response = client.patch(path, json={"description": "Preta", "price": 0})
    assert response.status_code == 200
    assert response.json() == {
        "id": item["id"],
        "name": "Caneta",
        "price": 0,
        "description": "Preta",
    }
    assert client.get(path).json() == response.json()
    assert client.patch(path, json={}).json() == response.json()
    response = client.patch(path, json={"description": None})
    assert response.status_code == 200
    assert response.json()["description"] is None

    response = client.delete(path)
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(path).status_code == 404
    assert client.get("/items").json() == []


def test_query_filter_and_pagination(client: TestClient) -> None:
    for name in ["Caneta azul", "Caderno", "Caneta preta"]:
        assert client.post("/items", json={"name": name, "price": 5}).status_code == 201
    response = client.get("/items", params={"q": "CANETA", "skip": 1, "limit": 1})
    assert response.status_code == 200
    assert [item["name"] for item in response.json()] == ["Caneta preta"]
    assert client.get("/items", params={"skip": 100}).json() == []
    assert client.get("/items", params={"q": "inexistente"}).json() == []


@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
def test_missing_item_returns_404(client: TestClient, method: str) -> None:
    kwargs = (
        {"json": {"name": "Novo", "price": 10}} if method in {"put", "patch"} else {}
    )
    response = client.request(method, "/items/999", **kwargs)
    assert response.status_code == 404
    assert response.json() == {"detail": "Item não encontrado"}
    assert client.get("/items").json() == []


@pytest.mark.parametrize("item_id", ["0", "-1", "abc"])
@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
def test_invalid_path_parameter(client: TestClient, method: str, item_id: str) -> None:
    kwargs = (
        {"json": {"name": "Novo", "price": 10}} if method in {"put", "patch"} else {}
    )
    assert client.request(method, f"/items/{item_id}", **kwargs).status_code == 422


@pytest.mark.parametrize(
    "params",
    [{"skip": -1}, {"limit": 0}, {"limit": 101}, {"skip": "abc"}, {"q": ""}],
)
def test_invalid_query_parameters(client: TestClient, params: dict) -> None:
    assert client.get("/items", params=params).status_code == 422


@pytest.mark.parametrize("method", ["post", "put"])
@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"name": "Caderno"},
        {"price": 10},
        {"name": "", "price": 10},
        {"name": "   ", "price": 10},
        {"name": "Caderno", "price": -1},
        {"name": "Caderno", "price": "inválido"},
        {"name": "Caderno", "price": None},
        {"name": None, "price": 10},
        {"name": "Caderno", "price": 10, "id": 42},
    ],
)
def test_invalid_create_and_replace_payloads(
    client: TestClient, method: str, payload: dict
) -> None:
    original = client.post("/items", json={"name": "Original", "price": 10}).json()
    path = "/items" if method == "post" else f"/items/{original['id']}"
    assert client.request(method, path, json=payload).status_code == 422
    assert client.get("/items").json() == [original]


@pytest.mark.parametrize(
    "payload",
    [{"name": None}, {"price": None}, {"name": " "}, {"price": -1}, {"id": 42}],
)
def test_invalid_patch_does_not_change_item(client: TestClient, payload: dict) -> None:
    original = client.post("/items", json={"name": "Original", "price": 10}).json()
    path = f"/items/{original['id']}"
    assert client.patch(path, json=payload).status_code == 422
    assert client.get(path).json() == original


def test_items_persist_across_app_instances(
    client: TestClient, db_engine: Engine
) -> None:
    from app.database.session import get_session
    from app.main import create_app

    item = client.post("/items", json={"name": "Caderno", "price": 10}).json()
    db_engine.dispose()
    restarted_app = create_app()
    restarted_app.dependency_overrides[get_session] = client.app.dependency_overrides[
        get_session
    ]
    with TestClient(restarted_app) as other_client:
        assert other_client.get(f"/items/{item['id']}").json() == item
        assert other_client.get("/items").json() == [item]
