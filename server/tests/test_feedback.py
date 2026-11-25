from datetime import date

import pytest

from app.core import AppError
from app.db.models import Client, Deal, Feedback
from app.service.feedback import FeedbackService


class _ScalarResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)


class _Session:
    def __init__(self, clients: dict, deals: dict, feedback: list[Feedback] | None = None):
        self.clients = clients
        self.deals = deals
        self.feedback = list(feedback or [])
        self.added = []
        self.deleted = []
        self.committed = False
        self.closed = False
        self._next_id = 70

    def get(self, model, key):
        if model is Client:
            return self.clients.get(key)
        if model is Deal:
            return self.deals.get(key)
        return None

    def scalars(self, statement):
        # Tests only query Feedback by client_id + deal_id.
        rows = sorted(
            self.feedback,
            key=lambda row: (
                row.created_at or date.min,
                row.id or 0,
            ),
            reverse=True,
        )
        # Filter to matching client/deal if the statement carries those values.
        where = getattr(statement, "_where_criteria", ())
        client_id = deal_id = None
        for criterion in where:
            left = getattr(criterion, "left", None)
            right = getattr(criterion, "right", None)
            key = getattr(left, "key", None) or getattr(left, "name", None)
            value = getattr(right, "value", right)
            if key == "client_id":
                client_id = value
            if key == "deal_id":
                deal_id = value
        if client_id is not None or deal_id is not None:
            rows = [
                row
                for row in rows
                if (client_id is None or row.client_id == client_id)
                and (deal_id is None or row.deal_id == deal_id)
            ]
        return _ScalarResult(rows)

    def add(self, row):
        self.added.append(row)
        self.feedback.append(row)

    def delete(self, row):
        self.deleted.append(row)
        if row in self.feedback:
            self.feedback.remove(row)

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


def _service(feedback: list[Feedback] | None = None):
    session = _Session(
        clients={"C-07": Client(id="C-07", name="Priya S.")},
        deals={"D-104": Deal(id="D-104", city="East Stroudsburg")},
        feedback=feedback,
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
    assert saved["action"] == "created"
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
    assert saved["action"] == "created"


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


def test_same_reaction_undoes_existing_feedback():
    existing = Feedback(
        id=12,
        client_id="C-07",
        deal_id="D-104",
        reaction="up",
        comment=None,
        created_at=date(2026, 11, 1),
    )
    service, session = _service([existing])

    result = service.create_feedback(
        {"client_id": "C-07", "deal_id": "D-104", "reaction": "up"}
    )

    assert result == {
        "action": "undone",
        "client_id": "C-07",
        "deal_id": "D-104",
    }
    assert existing in session.deleted
    assert session.feedback == []
    assert session.committed


def test_different_reaction_overwrites_existing_feedback():
    existing = Feedback(
        id=12,
        client_id="C-07",
        deal_id="D-104",
        reaction="up",
        comment="Liked it",
        created_at=date(2026, 11, 1),
    )
    service, session = _service([existing])

    saved = service.create_feedback(
        {"client_id": "C-07", "deal_id": "D-104", "reaction": "down"}
    )

    assert saved["action"] == "updated"
    assert saved["id"] == 12
    assert saved["reaction"] == "down"
    assert existing.reaction == "down"
    assert session.added == []
    assert session.deleted == []
    assert len(session.feedback) == 1


def test_overwrite_collapses_duplicate_rows():
    rows = [
        Feedback(
            id=20,
            client_id="C-07",
            deal_id="D-104",
            reaction="up",
            comment=None,
            created_at=date(2026, 11, 25),
        ),
        Feedback(
            id=19,
            client_id="C-07",
            deal_id="D-104",
            reaction="up",
            comment=None,
            created_at=date(2026, 11, 25),
        ),
        Feedback(
            id=18,
            client_id="C-07",
            deal_id="D-104",
            reaction="down",
            comment=None,
            created_at=date(2026, 10, 1),
        ),
    ]
    service, session = _service(rows)

    saved = service.create_feedback(
        {"client_id": "C-07", "deal_id": "D-104", "reaction": "down"}
    )

    assert saved["action"] == "updated"
    assert saved["id"] == 20
    assert saved["reaction"] == "down"
    assert len(session.feedback) == 1
    assert {row.id for row in session.deleted} == {19, 18}
