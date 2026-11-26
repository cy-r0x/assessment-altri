"use client";

import { useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, LandPlot, MapPin } from "lucide-react";

import { PageHeading, PageShell } from "@/components/PageShell";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { dealImageUrl, fetchDeals, formatBudget } from "@/lib/api";
import type { DealSummary, Pagination } from "@/lib/types";

const PAGE_SIZE = 12;

type DealListProps = {
  deals: DealSummary[];
  pagination: Pagination;
};

export function DealList({
  deals: initialDeals,
  pagination: initialPagination,
}: DealListProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [pagination, setPagination] = useState(initialPagination);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { page, total_pages, total } = pagination;

  function goToPage(nextPage: number) {
    if (pending || nextPage < 1 || nextPage > total_pages || nextPage === page) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchDeals(nextPage, PAGE_SIZE);
        setDeals(result.data);
        setPagination(result.pagination);
      } catch {
        setError("Couldn’t load deals");
      }
    });
  }

  return (
    <PageShell>
      <PageHeading
        title="Deals"
        description="Browse inventory and open a deal for full underwriting detail."
        trailing={
          total != null ? (
            <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium tabular-nums text-foreground-muted shadow-[inset_0_0_0_1px_var(--border)]">
              {total}
            </span>
          ) : null
        }
      />

      {deals.length === 0 && !pending ? (
        <div className="rounded-[14px] border border-dashed border-border bg-surface/70 px-6 py-14 text-center">
          <p className="text-[14px] text-foreground-muted">No deals yet.</p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy={pending}
        >
          {pending
            ? Array.from({ length: PAGE_SIZE }, (_, index) => (
                <li key={`skeleton-${index}`}>
                  <DealCardSkeleton />
                </li>
              ))
            : deals.map((deal, index) => {
                const location =
                  [deal.city, deal.state].filter(Boolean).join(", ") || "—";

                return (
                  <li key={deal.id}>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="card-interactive group flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                        <Image
                          src={dealImageUrl(deal.id)}
                          alt={`Photo of ${deal.address ?? deal.id}`}
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                          preload={index < 4}
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                        <span className="absolute bottom-3 right-3 rounded-[8px] bg-foreground/90 px-2.5 py-1 text-[15px] font-medium tabular-nums text-primary-foreground backdrop-blur-[2px]">
                          {formatBudget(deal.purchase_price)}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
                        <p className="truncate text-[16px] font-medium text-foreground">
                          {deal.address ?? deal.id}
                        </p>
                        <p className="flex items-center gap-1.5 text-[13px] text-foreground-muted">
                          <MapPin size={14} className="shrink-0" aria-hidden />
                          <span className="truncate">{location}</span>
                        </p>

                        <dl className="mt-3 grid grid-cols-3 divide-x divide-border border-t border-border pt-3">
                          <Spec
                            icon={<BedDouble size={14} aria-hidden />}
                            label="Beds"
                            value={deal.bedrooms}
                          />
                          <Spec
                            icon={<Bath size={14} aria-hidden />}
                            label="Baths"
                            value={deal.baths}
                          />
                          <Spec
                            icon={<LandPlot size={14} aria-hidden />}
                            label="Acres"
                            value={deal.lot_acres}
                          />
                        </dl>
                      </div>
                    </Link>
                  </li>
                );
              })}
        </ul>
      )}

      {error ? (
        <p className="mt-3 text-center text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <PaginationControls
        page={page}
        totalPages={total_pages}
        disabled={pending}
        onPageChange={goToPage}
      />
    </PageShell>
  );
}

export function DealsPageSkeleton() {
  return (
    <PageShell>
      <div className="mb-5 border-b border-border pb-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-3.5 w-72" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <li key={`page-skeleton-${index}`}>
            <DealCardSkeleton />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

function DealCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
        </div>
      </div>
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2">
      <dd className="text-[16px] font-medium tabular-nums text-foreground">{value ?? "—"}</dd>
      <dt className="inline-flex items-center gap-1 text-[12px] text-foreground-muted">
        {icon}
        {label}
      </dt>
    </div>
  );
}
