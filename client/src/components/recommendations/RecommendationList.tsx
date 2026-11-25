"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRecommendations } from "@/lib/api";
import type {
  FeedbackItem,
  Pagination,
  RecommendationsResponse,
} from "@/lib/types";

const PAGE_SIZE = 6;

type RecommendationListProps = {
  data: RecommendationsResponse;
  pagination?: Pagination;
  feedback?: FeedbackItem[];
};

function latestReactions(feedback: FeedbackItem[] | undefined): Map<string, "up" | "down"> {
  const map = new Map<string, "up" | "down">();
  if (!feedback) return map;
  for (const item of feedback) {
    if (map.has(item.deal_id)) continue;
    if (item.reaction === "up" || item.reaction === "down") {
      map.set(item.deal_id, item.reaction);
    }
  }
  return map;
}

export function RecommendationList({
  data: initialData,
  pagination: initialPagination,
  feedback,
}: RecommendationListProps) {
  const [recommendations, setRecommendations] = useState(initialData.recommendations);
  const [excluded] = useState(initialData.excluded);
  const clientId = initialData.client_id;
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination ?? {
      page: 1,
      limit: PAGE_SIZE,
      total: initialData.recommendations.length,
      total_pages: 1,
    },
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const reactions = latestReactions(feedback);

  const { page, total_pages } = pagination;
  const rankOffset = (page - 1) * pagination.limit;

  function goToPage(nextPage: number) {
    if (pending || nextPage < 1 || nextPage > total_pages || nextPage === page) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchRecommendations(clientId, nextPage, PAGE_SIZE);
        setRecommendations(result.data.recommendations);
        if (result.pagination) setPagination(result.pagination);
      } catch {
        setError("Couldn’t load recommendations");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <h2 className="text-[28px] font-medium tracking-tight text-foreground md:text-[32px]">
          Recommendations
        </h2>
      </div>

      {recommendations.length === 0 && !pending ? (
        <p className="text-[14px] text-foreground-muted">
          No deals pass this client&apos;s hard rules.
        </p>
      ) : (
        <>
          <ul
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            aria-busy={pending}
          >
            {pending
              ? Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <li key={`skeleton-${index}`}>
                    <RecommendationCardSkeleton />
                  </li>
                ))
              : recommendations.map((rec, index) => (
                  <li key={rec.deal.id}>
                    <RecommendationCard
                      clientId={clientId}
                      rec={rec}
                      rank={rankOffset + index + 1}
                      initialReaction={reactions.get(rec.deal.id) ?? null}
                    />
                  </li>
                ))}
          </ul>

          {error ? (
            <p className="mt-3 text-center text-[13px] text-danger">{error}</p>
          ) : null}

          {total_pages > 1 ? (
            <nav
              className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
              aria-label="Recommendations pagination"
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
        </>
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

function RecommendationCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-3 flex items-end gap-4 border-t border-border pt-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2 border-l border-border pl-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
        </div>
      </div>
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
