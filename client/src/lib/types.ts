export type ClientSummary = {
  id: string;
  name: string | null;
  budget: number | null;
  budget_range: string | null;
  budget_flexibility: string | null;
  main_focus: string | null;
  market_preferences: string[] | null;
  min_bedrooms: number | null;
  onboarded_at: string | null;
};

export type ClientProfile = ClientSummary & {
  down_payment_pct: number | null;
  cohost_fee_pct: number | null;
  avoid_markets: string[] | null;
  setting_rank: Record<string, number> | null;
  renovation_appetite: string | null;
  wow_factors: string[] | null;
  wants_turnkey: boolean | null;
  notes: string | null;
};

export type FeedbackItem = {
  id: number;
  client_id: string;
  deal_id: string;
  reaction: "up" | "down" | string;
  comment: string | null;
  created_at: string | null;
  deal_address?: string | null;
  deal_city?: string | null;
  deal_state?: string | null;
};

export type ClientDetail = {
  profile: ClientProfile;
  feedback: FeedbackItem[];
};

export type DealSummary = {
  id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  purchase_price: number | null;
  bedrooms: number | null;
  baths: number | null;
  lot_acres: number | null;
  turnkey: boolean | null;
  revenue: { low?: number; mid?: number; high?: number } | null;
  highlights: string[] | null;
  approved_at: string | null;
};

export type DealSetupItem = {
  item: string;
  cost: number;
};

export type DealComp = {
  listing_id: string;
  revenue: number;
  bedrooms: number;
  sleeps: number;
};

export type DealDetail = DealSummary & {
  interest_rate: number | null;
  closing_cost_pct: number | null;
  setup_items: DealSetupItem[] | null;
  annual_opex: number | null;
  est_year1_tax_savings: number | null;
  comps: DealComp[] | null;
  analyst_notes: string | null;
};

export type Range3<T> = { low: T; mid: T; high: T };

export type RecommendationMarket = {
  id: string | null;
  name: string | null;
  setting: string | null;
  annual_appreciation: number | null;
};

export type DealMetrics = {
  cash_needed: number;
  debt_service: number;
  cash_flow: Range3<number>;
  coc: Range3<number | null>;
};

export type Recommendation = {
  deal: DealSummary;
  market: RecommendationMarket;
  metrics: DealMetrics;
  explanation: string;
};

export type ExcludedDeal = {
  deal_id: string;
  rule: string;
  deal_address?: string | null;
  deal_city?: string | null;
  deal_state?: string | null;
};

export type RecommendationsResponse = {
  client_id: string;
  main_focus: string | null;
  recommendations: Recommendation[];
  excluded: ExcludedDeal[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

/** Mirrors server `PaginatedResult[T]` — always `data` + `pagination`. */
export type PaginatedResult<T> = {
  data: T;
  pagination: Pagination;
};

export type ApiSuccess<T> = {
  message: string;
  data: T;
  pagination?: Pagination;
};

/** List endpoints always include pagination alongside `data`. */
export type PaginatedApiSuccess<T> = {
  message: string;
  data: T;
  pagination: Pagination;
};
