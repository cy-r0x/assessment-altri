from __future__ import annotations

from math import ceil

from sqlalchemy import func, select

from app.core import AppError
from app.db import Client, Database, Deal, Feedback, Market, get_db_instance
from app.service.deal_math import compute_deal_metrics


def _norm(value: str | None) -> str:
    return (value or "").strip().lower()


def _label_matches(label: str, candidate: str) -> bool:
    """Loose match for messy preference labels (Smokies ↔ Smoky Mountains)."""
    a, b = _norm(label), _norm(candidate)
    if not a or not b:
        return False
    return a == b or a in b or b in a


def _budget_cap(client: Client) -> float:
    budget = float(client.budget or 0)
    if _norm(client.budget_flexibility) == "flexible":
        return budget * 1.10
    return budget


def _resolve_market(deal: Deal, markets: list[Market]) -> Market | None:
    city = _norm(deal.city)
    for market in markets:
        towns = market.towns or []
        if any(_norm(town) == city for town in towns):
            return market
    # Fallback: market name equals city (e.g. Scottsdale)
    for market in markets:
        if _norm(market.name) == city:
            return market
    return None


def _is_avoided(deal: Deal, market: Market | None, avoid_markets: list | None) -> str | None:
    avoids = [a for a in (avoid_markets or []) if a]
    if not avoids:
        return None

    for label in avoids:
        if _label_matches(label, deal.city or ""):
            return f"In avoided market ({label})"
        if market and _label_matches(label, market.name or ""):
            return f"In avoided market ({market.name})"
        if deal.state and _label_matches(label, deal.state):
            return f"In avoided market ({label})"
    return None


def _pencils(client: Client, metrics: dict) -> str | None:
    focus = _norm(client.main_focus)
    cf_low = metrics["cash_flow"]["low"]
    coc_low = metrics["coc"]["low"]

    if focus == "lifestyle":
        if cf_low < 0:
            return "Doesn't pencil: low cash flow is negative (lifestyle needs ≥ $0)"
        return None

    if coc_low is None or coc_low < 0.03:
        pct = "n/a" if coc_low is None else f"{coc_low * 100:.1f}%"
        return f"Doesn't pencil: low CoC is {pct} (needs ≥ 3%)"
    return None


def _rank_key(client: Client, deal: Deal, market: Market | None, metrics: dict):
    focus = _norm(client.main_focus)
    coc_mid = metrics["coc"]["mid"] or -999
    coc_low = metrics["coc"]["low"] or -999
    tax = float(deal.est_year1_tax_savings or 0)
    appr = float(market.annual_appreciation or 0) if market else 0.0
    setting = market.setting if market else None
    setting_rank = (client.setting_rank or {}).get(setting or "", 99)

    if focus == "tax_savings":
        return (-tax, -coc_mid, deal.id)
    if focus == "appreciation":
        return (-appr, -coc_mid, deal.id)
    if focus == "lifestyle":
        return (setting_rank, -coc_low, deal.id)
    # cash_flow (default)
    return (-coc_mid, -coc_low, deal.id)


def _explanation(client: Client, deal: Deal, market: Market | None, metrics: dict) -> str:
    focus = _norm(client.main_focus)
    coc_mid = metrics["coc"]["mid"]
    coc_txt = f"{coc_mid * 100:.1f}%" if coc_mid is not None else "n/a"
    place = market.name if market else (deal.city or deal.id)

    if focus == "tax_savings":
        tax = float(deal.est_year1_tax_savings or 0)
        return (
            f"Strong year-1 tax savings (${tax:,.0f}) in {place}; "
            f"mid CoC still {coc_txt}."
        )
    if focus == "appreciation":
        appr = float(market.annual_appreciation or 0) if market else 0
        return (
            f"Market appreciation outlook {appr * 100:.1f}% in {place}; "
            f"mid CoC {coc_txt}."
        )
    if focus == "lifestyle":
        setting = (market.setting if market else None) or "this setting"
        return (
            f"Fits preferred {setting.replace('_', ' ')} feel in {place} "
            f"with non-negative low cash flow and mid CoC {coc_txt}."
        )
    return (
        f"Best cash-on-cash fit: mid CoC {coc_txt} in {place} "
        f"within budget after financing and setup."
    )


def _pref_boost(client: Client, market: Market | None, deal: Deal) -> int:
    """Soft boost when deal lands in a stated preference (not a hard filter)."""
    prefs = client.market_preferences or []
    if not prefs or any(_norm(p) == "all" for p in prefs):
        return 0
    for pref in prefs:
        if market and _label_matches(pref, market.name or ""):
            return 0
        if _label_matches(pref, deal.city or "") or _label_matches(pref, deal.state or ""):
            return 0
        # "Florida" preference vs FL state markets
        if _norm(pref) == "florida" and _norm(deal.state) == "fl":
            return 0
    return 1  # sort after preferred


class ClientService:
    def __init__(self, db: Database | None = None) -> None:
        self.db = db or get_db_instance()

    def list_clients(self, page: int = 1, limit: int = 10):
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        session = self.db.get_session()
        try:
            total = session.scalar(select(func.count()).select_from(Client)) or 0
            clients = session.scalars(
                select(Client).order_by(Client.id).offset(offset).limit(limit)
            ).all()

            return {
                "items": [client.to_summary() for client in clients],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": ceil(total / limit) if limit else 0,
                },
            }
        finally:
            session.close()

    def get_client(self, client_id: str):
        session = self.db.get_session()
        try:
            client = session.get(Client, client_id)
            if client is None:
                raise AppError("Client not found", status_code=404)

            feedback = session.scalars(
                select(Feedback)
                .where(Feedback.client_id == client_id)
                .order_by(Feedback.created_at.desc(), Feedback.id.desc())
            ).all()

            deal_ids = {item.deal_id for item in feedback}
            deals_by_id = {
                deal.id: deal
                for deal in session.scalars(
                    select(Deal).where(Deal.id.in_(deal_ids))
                ).all()
            } if deal_ids else {}

            feedback_payload = []
            for item in feedback:
                deal = deals_by_id.get(item.deal_id)
                row = item.to_dict()
                row["deal_address"] = deal.address if deal else None
                row["deal_city"] = deal.city if deal else None
                row["deal_state"] = deal.state if deal else None
                feedback_payload.append(row)

            return {
                "profile": client.to_profile(),
                "feedback": feedback_payload,
            }
        finally:
            session.close()

    def get_recommendations(self, client_id: str):
        session = self.db.get_session()
        try:
            client = session.get(Client, client_id)
            if client is None:
                raise AppError("Client not found", status_code=404)

            deals = session.scalars(select(Deal).order_by(Deal.id)).all()
            markets = session.scalars(select(Market)).all()

            budget_cap = _budget_cap(client)
            recommendations = []
            excluded = []

            for deal in deals:
                market = _resolve_market(deal, markets)
                metrics = compute_deal_metrics(deal, client)

                # Hard filters — first matching rule wins for excluded reason
                if metrics["cash_needed"] > budget_cap:
                    flex = _norm(client.budget_flexibility) == "flexible"
                    rule = (
                        "Cash needed exceeds flexible budget (+10%)"
                        if flex
                        else "Cash needed exceeds budget"
                    )
                    excluded.append({"deal_id": deal.id, "rule": rule, "metrics": {
                        "cash_needed": metrics["cash_needed"],
                        "budget_cap": budget_cap,
                    }})
                    continue

                avoid_reason = _is_avoided(deal, market, client.avoid_markets)
                if avoid_reason:
                    excluded.append({"deal_id": deal.id, "rule": avoid_reason})
                    continue

                if client.min_bedrooms is not None and (deal.bedrooms or 0) < client.min_bedrooms:
                    beds = deal.bedrooms if deal.bedrooms is not None else 0
                    excluded.append(
                        {
                            "deal_id": deal.id,
                            "rule": (
                                f"Fewer bedrooms than minimum "
                                f"({beds} < {client.min_bedrooms})"
                            ),
                        }
                    )
                    continue

                pencil_reason = _pencils(client, metrics)
                if pencil_reason:
                    excluded.append(
                        {
                            "deal_id": deal.id,
                            "rule": pencil_reason,
                            "metrics": {
                                "coc_low": metrics["coc"]["low"],
                                "cash_flow_low": metrics["cash_flow"]["low"],
                            },
                        }
                    )
                    continue

                recommendations.append(
                    {
                        "deal": deal.to_summary(),
                        "market": {
                            "id": market.id if market else None,
                            "name": market.name if market else None,
                            "setting": market.setting if market else None,
                            "annual_appreciation": float(market.annual_appreciation)
                            if market and market.annual_appreciation is not None
                            else None,
                        },
                        "metrics": {
                            "cash_needed": metrics["cash_needed"],
                            "debt_service": metrics["debt_service"],
                            "cash_flow": metrics["cash_flow"],
                            "coc": metrics["coc"],
                        },
                        "explanation": _explanation(client, deal, market, metrics),
                        "_sort": (
                            _pref_boost(client, market, deal),
                            *_rank_key(client, deal, market, metrics),
                        ),
                    }
                )

            recommendations.sort(key=lambda row: row["_sort"])
            for row in recommendations:
                row.pop("_sort", None)

            return {
                "client_id": client_id,
                "main_focus": client.main_focus,
                "recommendations": recommendations,
                "excluded": excluded,
            }
        finally:
            session.close()


client_service = ClientService()
