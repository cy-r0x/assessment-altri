"""Client-specific deal math from the Part A brief."""

from __future__ import annotations


def yearly_debt_service(loan_amount: float, annual_rate: float, years: int = 30) -> float:
    """Yearly payment on a fixed amortizing loan (monthly compounding)."""
    if loan_amount <= 0:
        return 0.0
    months = years * 12
    monthly_rate = annual_rate / 12
    if monthly_rate == 0:
        return loan_amount / years
    factor = (1 + monthly_rate) ** months
    monthly_payment = loan_amount * (monthly_rate * factor) / (factor - 1)
    return monthly_payment * 12


def setup_total(setup_items: list | None) -> float:
    if not setup_items:
        return 0.0
    total = 0.0
    for item in setup_items:
        if isinstance(item, dict):
            total += float(item.get("cost") or 0)
        else:
            total += float(getattr(item, "cost", 0) or 0)
    return total


def cash_needed(
    purchase_price: float,
    down_payment_pct: float,
    closing_cost_pct: float,
    setup_items: list | None,
) -> float:
    """price×DP + price×closing% + setup×1.10."""
    setup = setup_total(setup_items) * 1.10
    return purchase_price * down_payment_pct + purchase_price * closing_cost_pct + setup


def cash_flow(revenue: float, annual_opex: float, cohost_fee_pct: float, debt_service: float) -> float:
    """revenue − opex − revenue×cohost − debt service."""
    return revenue - annual_opex - revenue * cohost_fee_pct - debt_service


def coc(flow: float, needed: float) -> float | None:
    if needed <= 0:
        return None
    return flow / needed


def compute_deal_metrics(deal, client) -> dict:
    price = float(deal.purchase_price or 0)
    down = float(client.down_payment_pct or 0)
    closing = float(deal.closing_cost_pct or 0)
    cohost = float(client.cohost_fee_pct or 0)
    opex = float(deal.annual_opex or 0)
    rate = float(deal.interest_rate or 0)

    needed = cash_needed(price, down, closing, deal.setup_items)
    loan = price * (1 - down)
    debt = yearly_debt_service(loan, rate)

    revenue = deal.revenue or {}
    low = float(revenue.get("low") or 0)
    mid = float(revenue.get("mid") or 0)
    high = float(revenue.get("high") or 0)

    cf_low = cash_flow(low, opex, cohost, debt)
    cf_mid = cash_flow(mid, opex, cohost, debt)
    cf_high = cash_flow(high, opex, cohost, debt)

    return {
        "cash_needed": needed,
        "loan_amount": loan,
        "debt_service": debt,
        "cash_flow": {"low": cf_low, "mid": cf_mid, "high": cf_high},
        "coc": {
            "low": coc(cf_low, needed),
            "mid": coc(cf_mid, needed),
            "high": coc(cf_high, needed),
        },
    }
