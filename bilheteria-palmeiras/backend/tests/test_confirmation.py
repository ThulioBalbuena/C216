from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from threading import Barrier
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.database import engine
from app.main import app
from app.models import Match, Sector, Simulation


@pytest.fixture
def catalog():
    with Session(engine) as db:
        match = Match(
            opponent="Adversário de teste",
            competition="Teste",
            venue="Estádio de teste",
            starts_at=datetime.now(UTC),
            opponent_initials="TST",
        )
        sector = Sector(
            match=match,
            name="Setor de teste",
            description="Vista do campo",
            price_cents=8000,
            remaining=3,
        )
        db.add(sector)
        db.flush()
        match_id, sector_id = match.id, sector.id
        db.commit()

    yield match_id, sector_id

    with Session(engine) as db:
        db.execute(delete(Simulation).where(Simulation.sector_id == sector_id))
        db.execute(delete(Sector).where(Sector.id == sector_id))
        db.execute(delete(Match).where(Match.id == match_id))
        db.commit()


def create_draft(client, sector_id):
    response = client.post("/api/simulations", json={"sector_id": sector_id, "quantity": 2})
    assert response.status_code == 201
    return f"/api/simulations/{response.json()['id']}"


def test_repeated_confirmation_deducts_stock_once(catalog):
    match_id, sector_id = catalog
    with TestClient(app, headers={"X-Browser-ID": str(uuid4())}) as client:
        path = create_draft(client, sector_id)
        confirmed = client.post(f"{path}/confirm")
        assert confirmed.status_code == 200
        assert confirmed.json()["code"].startswith("BP-")
        assert confirmed.json()["total_cents"] == 16000
        assert client.post(f"{path}/confirm").json() == confirmed.json()
        assert client.get(path).json() == confirmed.json()
        assert client.get(f"/api/matches/{match_id}").json()["sectors"][0]["remaining"] == 1
        assert client.put(path, json={"sector_id": sector_id, "quantity": 1}).status_code == 409
        assert client.delete(path).status_code == 409


def test_concurrent_orders_cannot_confirm_the_same_stock(catalog):
    match_id, sector_id = catalog
    with (
        TestClient(app, headers={"X-Browser-ID": str(uuid4())}) as first,
        TestClient(app, headers={"X-Browser-ID": str(uuid4())}) as second,
    ):
        pairs = [(first, create_draft(first, sector_id)), (second, create_draft(second, sector_id))]
        ready = Barrier(2, timeout=5)

        def confirm(pair):
            client, path = pair
            ready.wait()
            return client.post(f"{path}/confirm").status_code

        with ThreadPoolExecutor(max_workers=2) as executor:
            statuses = list(executor.map(confirm, pairs))

        assert sorted(statuses) == [200, 409]
        failed_client, failed_path = pairs[statuses.index(409)]
        assert failed_client.get(failed_path).json()["confirmed_at"] is None
        assert first.get(f"/api/matches/{match_id}").json()["sectors"][0]["remaining"] == 1
