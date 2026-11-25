import Link from "next/link";

import { formatBudget, formatCoc, formatFocus } from "@/lib/api";
import type { Recommendation, RecommendationsResponse } from "@/lib/types";

type RecommendationListProps = {
  data: RecommendationsResponse;
};

export function RecommendationList({ data }: RecommendationListProps) {
  const { recommendations, excluded, main_focus } = data;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            Recommendations
          </h2>
          <p className="mt-0.5 text-[14px] text-foreground-muted">
            <span className="tabular-nums">{recommendations.length}</span> ranked ·{" "}
            <span className="tabular-nums">{excluded.length}</span> excluded · ranked for{" "}
            {formatFocus(main_focus)}
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-[14px] text-foreground-muted">
          No deals pass this client&apos;s hard rules.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((rec, index) => (
            <li key={rec.deal.id}>
              <RecommendationCard rec={rec} rank={index + 1} />
            </li>
          ))}
        </ul>
      )}

      {excluded.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-[15px] font-medium text-foreground">Filtered out</h3>
          <ul className="mt-2 divide-y divide-border rounded-[14px] border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {excluded.map((item) => (
              <li
                key={item.deal_id}
                className="flex items-baseline gap-3 px-3.5 py-2.5 text-[13px]"
              >
                <Link
                  href={`/deals/${item.deal_id}`}
                  className="shrink-0 font-medium tabular-nums text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.deal_id}
                </Link>
                <span className="min-w-0 truncate text-foreground-muted">{item.rule}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const { deal, market, metrics } = rec;
  const marketLabel =
    market.name || [deal.city, deal.state].filter(Boolean).join(", ") || null;
  const setting = market.setting ? titleCase(market.setting) : null;
  const mid = metrics.coc.mid;
  const midTone =
    mid == null
      ? "text-foreground"
      : mid >= 0.08
        ? "text-success"
        : mid >= 0
          ? "text-foreground"
          : "text-danger";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums ${
                rank === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-muted text-foreground"
              }`}
            >
              #{rank}
            </span>
            {marketLabel ? (
              <span className="min-w-0 truncate text-[13px] text-foreground-muted">
                {marketLabel}
                {setting ? ` · ${setting}` : ""}
              </span>
            ) : null}
          </div>
          <p className="truncate text-[15px] font-medium text-foreground">
            {deal.address ?? deal.id}
          </p>
          <p className="text-[13px] tabular-nums text-foreground-subtle">
            {deal.id} · {deal.bedrooms ?? "—"} bd · {deal.baths ?? "—"} ba
            {deal.turnkey != null ? ` · ${deal.turnkey ? "Turnkey" : "Needs work"}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-medium tabular-nums text-foreground">
            {formatBudget(deal.purchase_price)}
          </p>
          <p className="text-[12px] text-foreground-subtle">list price</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-3">
        <div className="shrink-0">
          <p className={`text-[24px] leading-none font-medium tabular-nums ${midTone}`}>
            {formatCoc(mid)}
          </p>
          <p className="mt-1 text-[12px] text-foreground-muted">Cash-on-cash (mid)</p>
        </div>
        <div className="min-w-0 flex-1">
          <CocRange low={metrics.coc.low} mid={mid} high={metrics.coc.high} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <dt className="text-[12px] text-foreground-muted">Cash needed</dt>
          <dd className="text-[15px] font-medium tabular-nums text-foreground">
            {formatBudget(metrics.cash_needed)}
          </dd>
        </div>
        <div className="min-w-0 border-l border-border pl-3">
          <dt className="text-[12px] text-foreground-muted">Cash flow / yr (mid)</dt>
          <dd
            className={`text-[15px] font-medium tabular-nums ${
              metrics.cash_flow.mid < 0 ? "text-danger" : "text-foreground"
            }`}
          >
            {formatBudget(metrics.cash_flow.mid)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

const SCALE_MIN = 0;
const SCALE_MAX = 0.3;

function scalePos(value: number): number {
  const ratio = (value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
  return Math.min(1, Math.max(0, ratio)) * 100;
}

function CocRange({
  low,
  mid,
  high,
}: {
  low: number | null;
  mid: number | null;
  high: number | null;
}) {
  const labels = (
    <div className="flex justify-between gap-2 text-[12px] tabular-nums text-foreground-muted">
      <span className={low != null && low < 0 ? "text-danger" : undefined}>
        Low {formatCoc(low)}
      </span>
      <span>High {formatCoc(high)}</span>
    </div>
  );

  if (low == null || mid == null || high == null) return labels;

  const lowPos = scalePos(low);
  const highPos = scalePos(high);

  return (
    <div
      role="img"
      aria-label={`CoC range low ${formatCoc(low)}, mid ${formatCoc(mid)}, high ${formatCoc(high)}`}
      className="flex flex-col gap-1.5"
    >
      <div className="relative h-1.5 rounded-full bg-surface-muted">
        <span
          className="absolute inset-y-0 rounded-full bg-foreground/25"
          style={{ left: `${lowPos}%`, width: `${Math.max(0, highPos - lowPos)}%` }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-surface"
          style={{ left: `${scalePos(mid)}%` }}
        />
      </div>
      {labels}
    </div>
  );
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
