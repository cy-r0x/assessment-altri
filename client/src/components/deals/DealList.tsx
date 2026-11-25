import type { ReactNode } from "react";
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

import { dealImageUrl, formatBudget } from "@/lib/api";
import type { DealSummary, Pagination } from "@/lib/types";

type DealListProps = {
  deals: DealSummary[];
  pagination: Pagination;
};

export function DealList({ deals, pagination }: DealListProps) {
  const { page, total_pages } = pagination;

  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-4 md:px-8 xl:px-10">
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-[24px] font-medium tracking-tight text-foreground md:text-[26px]">
          Deals
        </h1>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {deals.map((deal, index) => {
          const location =
            [deal.city, deal.state].filter(Boolean).join(", ") || "—";

          return (
            <li key={deal.id}>
              <Link
                href={`/deals/${deal.id}`}
                className="flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      <nav
        className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
        aria-label="Pagination"
      >
        <PaginationLink
          page={page - 1}
          disabled={page <= 1}
          label="Previous"
          icon="prev"
        />
        <span className="px-2 text-[13px] tabular-nums text-foreground-muted">
          {page} / {total_pages}
        </span>
        <PaginationLink
          page={page + 1}
          disabled={page >= total_pages}
          label="Next"
          icon="next"
        />
      </nav>
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
