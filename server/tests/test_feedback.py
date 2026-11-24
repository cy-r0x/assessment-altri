from datetime import date

import pytest

from app.core import AppError
from app.db.models import Client, Deal
from app.service.feedback import FeedbackService


class _Session:
    def __init__(self, clients: dict, deals: dict):
        self.clients = clients
        self.deals = deals
        self.added = []
        self.committed = False
        self.closed = False
        self._next_id = 70

    def get(self, model, key):
        if model is Client:
            return self.clients.get(key)
        if model is Deal:
            return self.deals.get(key)
        return None

    def add(self, row):
        self.added.append(row)

    def commit(self):
        self.committed = True
        for row in self.added:
            if row.id is None:
                row.id = self._next_id
                self._next_id += 1

    def refresh(self, row):
        return None

    def rollback(self):
        self.committed = False

    def close(self):
        self.closed = True


class _DB:
    def __init__(self, session: _Session):
        self.session = session

    def get_session(self):
        return self.session


def _service():
    session = _Session(
        clients={"C-07": Client(id="C-07", name="Priya S.")},
        deals={"D-104": Deal(id="D-104", city="East Stroudsburg")},
    )
    return FeedbackService(db=_DB(session)), session


def test_create_feedback_persists_thumbs_down_with_comment():
    service, session = _service()

    saved = service.create_feedback(
        {
            "client_id": "C-07",
            "deal_id": "D-104",
            "reaction": "down",
            "comment": "  Backyard feels too small  ",
        }
    )

    assert session.committed
    assert session.closed
    assert saved["id"] == 70
    assert saved["client_id"] == "C-07"
    assert saved["deal_id"] == "D-104"
    assert saved["reaction"] == "down"
    assert saved["comment"] == "Backyard feels too small"
    assert saved["created_at"] == date.today().isoformat()


def test_create_feedback_blank_comment_is_stored_as_null():
    service, _session = _service()

    saved = service.create_feedback(
        {"client_id": "C-07", "deal_id": "D-104", "reaction": "up", "comment": "   "}
    )

    assert saved["reaction"] == "up"
    assert saved["comment"] is None


def test_create_feedback_unknown_client():
    service, session = _service()

    with pytest.raises(AppError) as exc:
        service.create_feedback(
            {"client_id": "C-99", "deal_id": "D-104", "reaction": "up"}
        )

    assert exc.value.status_code == 404
    assert session.added == []
    assert session.closed


def test_create_feedback_unknown_deal():
    service, session = _service()

    with pytest.raises(AppError) as exc:
        service.create_feedback(
            {"client_id": "C-07", "deal_id": "D-999", "reaction": "down"}
        )

    assert exc.value.status_code == 404
    assert "Deal not found" in exc.value.message
    assert session.added == []
