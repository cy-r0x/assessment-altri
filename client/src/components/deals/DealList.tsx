"use client";

import { useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  LandPlot,
  MapPin,
} from "lucide-react";

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

  const { page, total_pages } = pagination;

  function goToPage(nextPage: number) {
    if (pending || nextPage < 1 || nextPage > total_pages || nextPage === page) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchDeals(nextPage, PAGE_SIZE);
        setDeals(result.data);
        if (result.pagination) setPagination(result.pagination);
      } catch {
        setError("Couldn’t load deals");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-4 md:px-8 xl:px-10">
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-[24px] font-medium tracking-tight text-foreground md:text-[26px]">
          Deals
        </h1>
      </div>

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
                    className="flex h-full flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative aspect-[4/3] w-full bg-surface-muted">
                      <Image
                        src={dealImageUrl(deal.id)}
                        alt={`Photo of ${deal.address ?? deal.id}`}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                        preload={index < 4}
                      />
                      <span className="absolute bottom-3 right-3 rounded-[8px] bg-foreground/90 px-2.5 py-1 text-[15px] font-medium tabular-nums text-primary-foreground">
                        {formatBudget(deal.purchase_price)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
                      <p className="flex items-center gap-1.5 text-[13px] text-foreground-muted">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{location}</span>
                      </p>

                      <p className="truncate text-[16px] font-medium text-foreground">
                        {deal.address ?? deal.id}
                      </p>

                      <dl className="mt-3 grid grid-cols-3 divide-x divide-border border-t border-border pt-3">
                        <Spec icon={<BedDouble size={14} />} label="Beds" value={deal.bedrooms} />
                        <Spec icon={<Bath size={14} />} label="Baths" value={deal.baths} />
                        <Spec icon={<LandPlot size={14} />} label="Acres" value={deal.lot_acres} />
                      </dl>
                    </div>
                  </Link>
                </li>
              );
            })}
      </ul>

      {error ? (
        <p className="mt-3 text-center text-[13px] text-danger">{error}</p>
      ) : null}

      {total_pages > 1 ? (
        <nav
          className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
          aria-label="Pagination"
        >
          <PaginationButton
            disabled={pending || page <= 1}
            label="Previous"
            icon="prev"
            onClick={() => goToPage(page - 1)}
          />
          <span className="px-2 text-[13px] tabular-nums text-foreground-muted">
            {page} / {total_pages}
          </span>
          <PaginationButton
            disabled={pending || page >= total_pages}
            label="Next"
            icon="next"
            onClick={() => goToPage(page + 1)}
          />
        </nav>
      ) : null}
    </div>
  );
}

export function DealsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-4 md:px-8 xl:px-10">
      <div className="mb-4 border-b border-border pb-4">
        <Skeleton className="h-8 w-24" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <li key={`page-skeleton-${index}`}>
            <DealCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
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

function PaginationButton({
  disabled,
  label,
  icon,
  onClick,
}: {
  disabled: boolean;
  label: string;
  icon: "prev" | "next";
  onClick: () => void;
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
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-[28px] border border-foreground px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </button>
  );
}
