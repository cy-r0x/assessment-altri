import type { ReactNode } from "react";
import Image from "next/image";
import {
  Bath,
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  Home,
  LandPlot,
  MapPin,
  Percent,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { BackLink, PageShell } from "@/components/PageShell";
import { dealImageUrl, fetchDeal, formatBudget, formatPct } from "@/lib/api";

type DealPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;

  let result;
  try {
    result = await fetchDeal(id);
  } catch {
    notFound();
  }

  const deal = result.data;
  const location = [deal.city, deal.state].filter(Boolean).join(", ") || "—";
  const setupTotal =
    deal.setup_items?.reduce((sum, item) => sum + (item.cost ?? 0), 0) ?? null;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <PageShell width="detail">
        <BackLink href="/deals" label="Deals" />

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch">
          <section className="h-full rounded-[14px] border border-border/80 bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="relative mb-5 aspect-[2/1] w-full overflow-hidden rounded-[12px] bg-surface-muted">
              <Image
                src={dealImageUrl(deal.id, 1600, 800)}
                alt={`Photo of ${deal.address ?? deal.id}`}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                preload
              />
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] tabular-nums text-foreground-muted">{deal.id}</p>
                <h1 className="mt-1 text-[22px] font-medium tracking-tight text-foreground md:text-[26px]">
                  {deal.address ?? "Deal"}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-[14px] text-foreground-muted">
                  <MapPin size={14} className="shrink-0" aria-hidden />
                  {location}
                </p>
              </div>
              <p className="rounded-[10px] bg-foreground px-3 py-1.5 text-[20px] font-medium tabular-nums text-primary-foreground md:text-[22px]">
                {formatBudget(deal.purchase_price)}
              </p>
            </div>

            {deal.analyst_notes ? (
              <p className="mt-4 border-t border-border pt-4 text-pretty text-[14px] leading-relaxed text-foreground-muted">
                {deal.analyst_notes}
              </p>
            ) : null}

            <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Fact icon={<BedDouble size={18} />} label="Bedrooms" value={String(deal.bedrooms ?? "—")} />
              <Fact icon={<Bath size={18} />} label="Baths" value={String(deal.baths ?? "—")} />
              <Fact
                icon={<LandPlot size={18} />}
                label="Lot"
                value={deal.lot_acres != null ? `${deal.lot_acres} acres` : "—"}
              />
              <Fact
                icon={<Home size={18} />}
                label="Turnkey"
                value={deal.turnkey == null ? "—" : deal.turnkey ? "Yes" : "No"}
              />
              <Fact icon={<Percent size={18} />} label="Interest rate" value={formatPct(deal.interest_rate)} />
              <Fact icon={<Percent size={18} />} label="Closing cost" value={formatPct(deal.closing_cost_pct)} />
              <Fact icon={<CircleDollarSign size={18} />} label="Annual opex" value={formatBudget(deal.annual_opex)} />
              <Fact
                icon={<CircleDollarSign size={18} />}
                label="Year-1 tax savings"
                value={formatBudget(deal.est_year1_tax_savings)}
              />
              <Fact
                icon={<CalendarDays size={18} />}
                label="Approved"
                value={formatDate(deal.approved_at)}
                wide
              />
            </dl>

            {deal.highlights?.length ? (
              <div className="mt-6">
                <h2 className="flex items-center gap-2 text-[16px] font-medium text-foreground">
                  <Sparkles size={16} aria-hidden />
                  Highlights
                </h2>
                <ul className="mt-3 space-y-2">
                  {deal.highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-[10px] bg-surface-muted/80 px-3.5 py-2.5 text-[14px] text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <aside className="flex h-full min-h-0 flex-col gap-5">
            <section className="rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-[16px] font-medium text-foreground">Revenue</h2>
              <dl className="mt-3 grid grid-cols-3 gap-2">
                <RevenueCell label="Low" value={deal.revenue?.low} />
                <RevenueCell label="Mid" value={deal.revenue?.mid} />
                <RevenueCell label="High" value={deal.revenue?.high} />
              </dl>
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex shrink-0 items-baseline justify-between gap-2">
                <h2 className="text-[16px] font-medium text-foreground">Setup</h2>
                {setupTotal != null ? (
                  <span className="text-[13px] font-medium tabular-nums text-foreground">
                    {formatBudget(setupTotal)}
                  </span>
                ) : null}
              </div>
              {deal.setup_items?.length ? (
                <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {deal.setup_items.map((item) => (
                    <li
                      key={`${item.item}-${item.cost}`}
                      className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface-muted/80 px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-[13px] text-foreground">{item.item}</span>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums text-foreground">
                        {formatBudget(item.cost)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[13px] text-foreground-muted">No setup items.</p>
              )}
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <h2 className="shrink-0 text-[16px] font-medium text-foreground">Comps</h2>
              {deal.comps?.length ? (
                <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {deal.comps.map((comp) => (
                    <li
                      key={comp.listing_id}
                      className="rounded-[10px] border border-border bg-surface-muted/80 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {comp.listing_id}
                        </p>
                        <span className="shrink-0 text-[13px] font-medium tabular-nums text-foreground">
                          {formatBudget(comp.revenue)}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-foreground-muted">
                        {comp.bedrooms} bed · sleeps {comp.sleeps}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[13px] text-foreground-muted">No comps.</p>
              )}
            </section>
          </aside>
        </div>
      </PageShell>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  wide = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[10px] bg-surface-muted/80 px-3.5 py-3 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] tracking-wide text-foreground-muted">{label}</dt>
        <dd className="mt-0.5 truncate text-[14px] text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function RevenueCell({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-[10px] bg-surface-muted/80 px-3 py-3 text-center">
      <dt className="text-[11px] text-foreground-muted">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium tabular-nums text-foreground">
        {formatBudget(value)}
      </dd>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
