"""Hard-filter and ranking tests for client recommendations (Part A)."""

from __future__ import annotations

from datetime import date

from app.db.models import Client, Deal, Feedback, Market
from app.service.clients import (
    ClientService,
    _budget_cap,
    _is_avoided,
    _pencils,
    _pref_boost,
    _rank_key,
    _resolve_market,
)


# --- Fake DB (mirrors test_feedback style) ---------------------------------


class _ScalarResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)


class _Session:
    def __init__(
        self,
        *,
        clients: dict[str, Client],
        deals: list[Deal],
        markets: list[Market],
        feedback: list[Feedback] | None = None,
    ):
        self.clients = clients
        self.deals = deals
        self.markets = markets
        self.feedback = list(feedback or [])
        self.closed = False

    def get(self, model, key):
        if model is Client:
            return self.clients.get(key)
        return None

    def scalars(self, statement):
        entity = statement.column_descriptions[0]["entity"]
        if entity is Deal:
            return _ScalarResult(self.deals)
        if entity is Market:
            return _ScalarResult(self.markets)
        if entity is Feedback:
            rows = sorted(
                self.feedback,
                key=lambda row: (row.created_at or date.min, row.id or 0),
                reverse=True,
            )
            return _ScalarResult(rows)
        return _ScalarResult([])

    def close(self):
        self.closed = True


class _DB:
    def __init__(self, session: _Session):
        self.session = session

    def get_session(self):
        return self.session


def _client(**overrides) -> Client:
    defaults = dict(
        id="C-07",
        name="Priya S.",
        budget=300_000,
        budget_flexibility="strict",
        down_payment_pct=0.20,
        cohost_fee_pct=0.12,
        main_focus="cash_flow",
        market_preferences=["Poconos"],
        avoid_markets=[],
        setting_rank={"lake_mountain": 1, "beach_coastal": 2},
        min_bedrooms=4,
    )
    defaults.update(overrides)
    return Client(**defaults)


def _deal(**overrides) -> Deal:
    defaults = dict(
        id="D-100",
        address="1 Test St",
        city="East Stroudsburg",
        state="PA",
        purchase_price=200_000,
        bedrooms=4,
        baths=2,
        interest_rate=0.07,
        closing_cost_pct=0.03,
        setup_items=[],
        annual_opex=20_000,
        revenue={"low": 80_000, "mid": 90_000, "high": 100_000},
        est_year1_tax_savings=40_000,
    )
    defaults.update(overrides)
    return Deal(**defaults)


def _market(**overrides) -> Market:
    defaults = dict(
        id="M-1",
        name="Poconos",
        state="PA",
        towns=["East Stroudsburg"],
        setting="lake_mountain",
        annual_appreciation=0.04,
    )
    defaults.update(overrides)
    return Market(**defaults)


def _service(
    client: Client,
    deals: list[Deal],
    markets: list[Market] | None = None,
    feedback: list[Feedback] | None = None,
):
    session = _Session(
        clients={client.id: client},
        deals=deals,
        markets=markets if markets is not None else [_market()],
        feedback=feedback,
    )
    return ClientService(db=_DB(session)), session


# --- Unit: budget / avoid / pencil / resolve --------------------------------


def test_budget_cap_strict_equals_budget():
    assert _budget_cap(_client(budget=300_000, budget_flexibility="strict")) == 300_000


def test_budget_cap_flexible_adds_ten_percent():
    assert _budget_cap(_client(budget=300_000, budget_flexibility="flexible")) == 330_000


def test_is_avoided_matches_market_name():
    deal = _deal(city="Charlotte")
    market = _market(id="M-c", name="Charlotte", towns=["Charlotte"])
    reason = _is_avoided(deal, market, ["Charlotte"])
    assert reason is not None
    assert "avoided" in reason.lower()


def test_is_avoided_returns_none_when_ok():
    deal = _deal()
    market = _market()
    assert _is_avoided(deal, market, ["Charlotte"]) is None


def test_pencils_rejects_low_coc_under_three_percent():
    metrics = {"cash_flow": {"low": 1_000}, "coc": {"low": 0.02}}
    reason = _pencils(_client(main_focus="cash_flow"), metrics)
    assert reason is not None
    assert "3%" in reason


def test_pencils_allows_low_coc_when_lifestyle_and_cf_non_negative():
    metrics = {"cash_flow": {"low": 0}, "coc": {"low": 0.01}}
    assert _pencils(_client(main_focus="lifestyle"), metrics) is None


def test_pencils_rejects_negative_cash_flow_for_lifestyle():
    metrics = {"cash_flow": {"low": -100}, "coc": {"low": 0.10}}
    reason = _pencils(_client(main_focus="lifestyle"), metrics)
    assert reason is not None
    assert "lifestyle" in reason.lower()


def test_resolve_market_by_town():
    deal = _deal(city="East Stroudsburg")
    markets = [
        _market(id="M-other", name="Other", towns=["Somewhere"]),
        _market(id="M-poc", name="Poconos", towns=["East Stroudsburg"]),
    ]
    assert _resolve_market(deal, markets).id == "M-poc"


# --- Unit: ranking ----------------------------------------------------------


def test_rank_key_cash_flow_prefers_higher_mid_coc():
    client = _client(main_focus="cash_flow")
    high = {"coc": {"mid": 0.20, "low": 0.10}}
    low = {"coc": {"mid": 0.08, "low": 0.05}}
    assert _rank_key(client, _deal(id="A"), None, high) < _rank_key(
        client, _deal(id="B"), None, low
    )


def test_rank_key_tax_savings_prefers_higher_tax():
    client = _client(main_focus="tax_savings")
    metrics = {"coc": {"mid": 0.10, "low": 0.05}}
    richer = _deal(id="A", est_year1_tax_savings=90_000)
    poorer = _deal(id="B", est_year1_tax_savings=10_000)
    assert _rank_key(client, richer, None, metrics) < _rank_key(
        client, poorer, None, metrics
    )


def test_rank_key_appreciation_prefers_higher_market_appr():
    client = _client(main_focus="appreciation")
    metrics = {"coc": {"mid": 0.10, "low": 0.05}}
    hot = _market(id="M-hot", annual_appreciation=0.08)
    cool = _market(id="M-cool", annual_appreciation=0.02)
    assert _rank_key(client, _deal(id="A"), hot, metrics) < _rank_key(
        client, _deal(id="B"), cool, metrics
    )


def test_pref_boost_preferred_markets_sort_first():
    client = _client(market_preferences=["Poconos"])
    preferred = _market(name="Poconos", towns=["East Stroudsburg"])
    other = _market(id="M-2", name="Blue Ridge", towns=["Asheville"])
    assert _pref_boost(client, preferred, _deal()) == 0
    assert _pref_boost(client, other, _deal(city="Asheville", state="NC")) == 1


# --- Integration: get_recommendations hard filters --------------------------


def test_recommendations_exclude_over_budget():
    # Cash needed ≈ 200k*0.20 + 200k*0.03 = 46k; budget 40k → excluded
    client = _client(budget=40_000, budget_flexibility="strict", min_bedrooms=1)
    deal = _deal(id="D-budget", purchase_price=200_000, setup_items=[])
    service, _ = _service(client, [deal])

    result = service.get_recommendations("C-07", page=1, limit=20)
    assert result["data"]["recommendations"] == []
    assert len(result["data"]["excluded"]) == 1
    assert "budget" in result["data"]["excluded"][0]["rule"].lower()


def test_recommendations_flexible_budget_allows_ten_percent_over():
    # cash_needed = 100k*0.20 + 100k*0.03 = 23_000; budget 21_000 → cap 23_100
    client = _client(
        budget=21_000,
        budget_flexibility="flexible",
        min_bedrooms=1,
        avoid_markets=[],
        market_preferences=["all"],
    )
    deal = _deal(
        id="D-flex",
        purchase_price=100_000,
        setup_items=[],
        revenue={"low": 50_000, "mid": 55_000, "high": 60_000},
        annual_opex=5_000,
    )
    service, _ = _service(client, [deal])

    result = service.get_recommendations("C-07", page=1, limit=20)
    ids = [row["deal"]["id"] for row in result["data"]["recommendations"]]
    assert "D-flex" in ids


def test_recommendations_exclude_avoided_market():
    client = _client(
        budget=500_000,
        min_bedrooms=1,
        avoid_markets=["Charlotte"],
        market_preferences=["all"],
    )
    deal = _deal(id="D-avoid", city="Charlotte", purchase_price=150_000)
    market = _market(id="M-c", name="Charlotte", towns=["Charlotte"])
    service, _ = _service(client, [deal], [market])

    result = service.get_recommendations("C-07", page=1, limit=20)
    assert result["data"]["recommendations"] == []
    assert "avoided" in result["data"]["excluded"][0]["rule"].lower()


def test_recommendations_exclude_too_few_bedrooms():
    client = _client(budget=500_000, min_bedrooms=4, market_preferences=["all"])
    deal = _deal(id="D-beds", bedrooms=3, purchase_price=150_000)
    service, _ = _service(client, [deal])

    result = service.get_recommendations("C-07", page=1, limit=20)
    assert result["data"]["recommendations"] == []
    rule = result["data"]["excluded"][0]["rule"].lower()
    assert "bedroom" in rule
    assert "3 < 4" in rule


def test_recommendations_exclude_when_doesnt_pencil():
    # Tiny revenue → low CoC under 3%
    client = _client(
        budget=500_000,
        min_bedrooms=1,
        main_focus="cash_flow",
        market_preferences=["all"],
    )
    deal = _deal(
        id="D-pencil",
        purchase_price=200_000,
        revenue={"low": 5_000, "mid": 6_000, "high": 7_000},
        annual_opex=40_000,
        setup_items=[],
    )
    service, _ = _service(client, [deal])

    result = service.get_recommendations("C-07", page=1, limit=20)
    assert result["data"]["recommendations"] == []
    assert "pencil" in result["data"]["excluded"][0]["rule"].lower()


def test_recommendations_rank_cash_flow_by_mid_coc():
    client = _client(
        budget=1_000_000,
        min_bedrooms=1,
        main_focus="cash_flow",
        market_preferences=["all"],
        avoid_markets=[],
    )
    # Same financing inputs; higher mid revenue → higher mid CoC → ranks first
    stronger = _deal(
        id="D-strong",
        purchase_price=200_000,
        revenue={"low": 70_000, "mid": 120_000, "high": 130_000},
        annual_opex=15_000,
        setup_items=[],
    )
    weaker = _deal(
        id="D-weak",
        purchase_price=200_000,
        city="East Stroudsburg",
        revenue={"low": 70_000, "mid": 75_000, "high": 80_000},
        annual_opex=15_000,
        setup_items=[],
    )
    service, _ = _service(client, [weaker, stronger])

    result = service.get_recommendations("C-07", page=1, limit=20)
    ids = [row["deal"]["id"] for row in result["data"]["recommendations"]]
    assert ids[:2] == ["D-strong", "D-weak"]
    assert all(row.get("explanation") for row in result["data"]["recommendations"])


def test_dislike_moves_deal_to_filtered_out():
    client = _client(
        budget=1_000_000,
        min_bedrooms=1,
        market_preferences=["all"],
        avoid_markets=[],
    )
    deal = _deal(id="D-down", purchase_price=150_000, setup_items=[])
    feedback = [
        Feedback(
            id=1,
            client_id="C-07",
            deal_id="D-down",
            reaction="down",
            comment=None,
            created_at=date(2026, 10, 1),
        )
    ]
    service, _ = _service(client, [deal], feedback=feedback)

    result = service.get_recommendations("C-07", page=1, limit=20)
    assert result["data"]["recommendations"] == []
    assert len(result["data"]["excluded"]) == 1
    assert result["data"]["excluded"][0]["deal_id"] == "D-down"
    assert "disliked" in result["data"]["excluded"][0]["rule"].lower()


def test_removing_dislike_restores_deal_to_recommendations():
    """Undo deletes feedback → next recommendations include the deal again."""
    client = _client(
        budget=1_000_000,
        min_bedrooms=1,
        market_preferences=["all"],
        avoid_markets=[],
    )
    deal = _deal(id="D-back", purchase_price=150_000, setup_items=[])
    service, _ = _service(client, [deal], feedback=[])

    result = service.get_recommendations("C-07", page=1, limit=20)
    ids = [row["deal"]["id"] for row in result["data"]["recommendations"]]
    assert "D-back" in ids
    assert not any(row["deal_id"] == "D-back" for row in result["data"]["excluded"])


def test_like_boosts_deal_to_front():
    client = _client(
        budget=1_000_000,
        min_bedrooms=1,
        main_focus="cash_flow",
        market_preferences=["all"],
        avoid_markets=[],
    )
    stronger = _deal(
        id="D-strong",
        purchase_price=200_000,
        revenue={"low": 70_000, "mid": 120_000, "high": 130_000},
        annual_opex=15_000,
        setup_items=[],
    )
    weaker = _deal(
        id="D-liked",
        purchase_price=200_000,
        revenue={"low": 70_000, "mid": 75_000, "high": 80_000},
        annual_opex=15_000,
        setup_items=[],
    )
    feedback = [
        Feedback(
            id=1,
            client_id="C-07",
            deal_id="D-liked",
            reaction="up",
            created_at=date(2026, 10, 1),
        )
    ]
    service, _ = _service(client, [stronger, weaker], feedback=feedback)

    result = service.get_recommendations("C-07", page=1, limit=20)
    ids = [row["deal"]["id"] for row in result["data"]["recommendations"]]
    assert ids[0] == "D-liked"
