import type { ReactNode } from "react";
import Link from "next/link";
import { Bath, BedDouble } from "lucide-react";

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
  const { deal, market, metrics, explanation } = rec;
  const marketLabel =
    market.name || [deal.city, deal.state].filter(Boolean).join(", ") || null;
  const setting = market.setting ? titleCase(market.setting) : null;

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="flex h-full flex-col gap-2.5 rounded-[14px] border border-border bg-surface px-3.5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-2.5">
        <span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-2 py-0.5 text-[12px] font-medium tabular-nums text-foreground">
          #{rank}
        </span>
        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
          {deal.address ?? deal.id}
        </p>
        <p className="shrink-0 text-[15px] font-medium tabular-nums text-foreground">
          {formatBudget(deal.purchase_price)}
        </p>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-foreground-muted">
        <span className="tabular-nums">{deal.id}</span>
        <span className="text-border-strong">·</span>
        <span className="inline-flex items-center gap-1">
          <BedDouble size={13} />
          <span className="tabular-nums">{deal.bedrooms ?? "—"}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Bath size={13} />
          <span className="tabular-nums">{deal.baths ?? "—"}</span>
        </span>
        {marketLabel ? (
          <>
            <span className="text-border-strong">·</span>
            <span>{marketLabel}</span>
          </>
        ) : null}
        {setting ? (
          <>
            <span className="text-border-strong">·</span>
            <span>{setting}</span>
          </>
        ) : null}
      </p>

      <dl className="grid grid-cols-3 gap-2">
        <Metric label="Cash needed" negative={metrics.cash_needed < 0}>
          {formatBudget(metrics.cash_needed)}
        </Metric>
        <Metric label="CoC low / mid / high">
          <span className="flex flex-wrap gap-x-1.5">
            <Coc value={metrics.coc.low} />
            <Coc value={metrics.coc.mid} />
            <Coc value={metrics.coc.high} />
          </span>
        </Metric>
        <Metric label="Cash flow (mid)" negative={metrics.cash_flow.mid < 0}>
          {formatBudget(metrics.cash_flow.mid)}
        </Metric>
      </dl>

      <p className="text-pretty text-[13px] leading-snug text-foreground-muted">{explanation}</p>
    </Link>
  );
}

function Metric({
  label,
  negative = false,
  children,
}: {
  label: string;
  negative?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[10px] bg-surface-muted/80 px-2.5 py-2">
      <dt className="text-[11px] tracking-wide text-foreground-muted">{label}</dt>
      <dd
        className={`mt-0.5 text-[13px] font-medium tabular-nums ${
          negative ? "text-danger" : "text-foreground"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

function Coc({ value }: { value: number | null }) {
  return <span className={value != null && value < 0 ? "text-danger" : undefined}>{formatCoc(value)}</span>;
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
