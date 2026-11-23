from app.service.deal_math import cash_flow, cash_needed, coc, yearly_debt_service


def test_yearly_debt_service_known_case():
    # $80 loan @ 7% for 30y ≈ $6.39 / year
    assert round(yearly_debt_service(80, 0.07), 2) == 6.39


def test_cash_needed_applies_buffer_only_to_setup():
    # price 100, DP 20%, closing 3%, setup 10 → 20 + 3 + 11 = 34
    assert cash_needed(100, 0.20, 0.03, [{"item": "x", "cost": 10}]) == 34.0


def test_cash_flow_and_coc():
    flow = cash_flow(revenue=100_000, annual_opex=20_000, cohost_fee_pct=0.10, debt_service=30_000)
    # 100k - 20k - 10k - 30k = 40k
    assert flow == 40_000
    assert coc(flow, 200_000) == 0.2
