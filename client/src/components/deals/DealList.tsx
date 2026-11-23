import Link from "next/link";
import { Bath, BedDouble, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { formatBudget } from "@/lib/api";
import type { DealSummary, Pagination } from "@/lib/types";

type DealListProps = {
  deals: DealSummary[];
  pagination: Pagination;
};

export function DealList({ deals, pagination }: DealListProps) {
  const { page, total_pages, total } = pagination;

  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-4 md:px-8 xl:px-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-[24px] font-medium tracking-tight text-foreground md:text-[26px]">
            Deals
          </h1>
          <p className="mt-0.5 text-[14px] text-foreground-muted">
            Available inventory across markets
          </p>
        </div>
        <p className="text-[14px] tabular-nums text-foreground-muted">
          {total} total · page {page} of {total_pages}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {deals.map((deal) => {
          const location = [deal.city, deal.state].filter(Boolean).join(", ") || "—";
          const midRevenue = deal.revenue?.mid;

          return (
            <li key={deal.id}>
              <article className="flex h-full flex-col gap-2 rounded-[14px] border border-border bg-surface px-3.5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium text-foreground">
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
                  {deal.turnkey != null ? (
                    <>
                      <span className="text-border-strong">·</span>
                      <span>{deal.turnkey ? "Turnkey" : "Needs work"}</span>
                    </>
                  ) : null}
                </p>

                <p className="flex items-center gap-1.5 text-[13px] text-foreground-subtle">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{location}</span>
                  {midRevenue != null ? (
                    <span className="ml-auto shrink-0 tabular-nums">
                      Mid rev {formatBudget(midRevenue)}
                    </span>
                  ) : null}
                </p>
              </article>
            </li>
          );
        })}
      </ul>

      <nav
        className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
        aria-label="Pagination"
      >
        <PaginationLink page={page - 1} disabled={page <= 1} label="Previous" icon="prev" />
        <span className="px-2 text-[13px] tabular-nums text-foreground-muted">
          {page} / {total_pages}
        </span>
        <PaginationLink page={page + 1} disabled={page >= total_pages} label="Next" icon="next" />
      </nav>
    </div>
  );
}

function PaginationLink({
  page,
  disabled,
  label,
  icon,
}: {
  page: number;
  disabled: boolean;
  label: string;
  icon: "prev" | "next";
}) {
  const Icon = icon === "prev" ? ChevronLeft : ChevronRight;
  const content = (
    <>
      {icon === "prev" ? <Icon size={16} /> : null}
      <span>{label}</span>
      {icon === "next" ? <Icon size={16} /> : null}
    </>
  );

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[28px] border border-border px-3 py-1.5 text-[13px] text-foreground-subtle">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={`/deals?page=${page}`}
      className="inline-flex items-center gap-1 rounded-[28px] border border-foreground px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
