"use client";

import { useState, useTransition } from "react";

import { ExcludedDealsPanel } from "@/components/recommendations/ExcludedDealsPanel";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { PaginationControls } from "@/components/ui/pagination-controls";
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

function latestFeedbackByDeal(
  feedback: FeedbackItem[] | undefined,
): Map<string, { reaction: "up" | "down"; comment: string | null }> {
  const map = new Map<string, { reaction: "up" | "down"; comment: string | null }>();
  if (!feedback) return map;
  for (const item of feedback) {
    if (map.has(item.deal_id)) continue;
    if (item.reaction === "up" || item.reaction === "down") {
      map.set(item.deal_id, {
        reaction: item.reaction,
        comment: item.comment ?? null,
      });
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
  const [excluded, setExcluded] = useState(initialData.excluded);
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
  const feedbackByDeal = latestFeedbackByDeal(feedback);

  const { page, total_pages } = pagination;
  const rankOffset = (page - 1) * pagination.limit;

  function applyResult(
    result: Awaited<ReturnType<typeof fetchRecommendations>>,
  ) {
    setRecommendations(result.data.recommendations);
    setExcluded(result.data.excluded);
    if (result.pagination) setPagination(result.pagination);
  }

  function reload(nextPage = page) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchRecommendations(clientId, nextPage, PAGE_SIZE);
        applyResult(result);
      } catch {
        setError("Couldn’t load recommendations");
      }
    });
  }

  function goToPage(nextPage: number) {
    if (pending || nextPage < 1 || nextPage > total_pages || nextPage === page) return;
    reload(nextPage);
  }

  function onFeedbackChange() {
    // Dislike may remove a card; reload page 1 so ranks + filtered-out stay in sync.
    reload(1);
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="text-[28px] font-medium tracking-tight text-foreground md:text-[32px]">
          Recommendations
        </h2>
        <p className="mt-1.5 text-[13px] text-foreground-muted">
          Ranked matches that clear this client&apos;s hard filters
        </p>
      </div>

      {recommendations.length === 0 && !pending ? (
        <div className="rounded-[14px] border border-dashed border-border bg-surface/70 px-6 py-12 text-center">
          <p className="text-[14px] text-foreground-muted">
            No deals pass this client&apos;s hard rules.
          </p>
        </div>
      ) : (
        <>
          <ul
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-busy={pending}
          >
            {pending
              ? Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <li key={`skeleton-${index}`}>
                    <RecommendationCardSkeleton />
                  </li>
                ))
              : recommendations.map((rec, index) => {
                  const prior = feedbackByDeal.get(rec.deal.id);
                  return (
                    <li key={rec.deal.id}>
                      <RecommendationCard
                        clientId={clientId}
                        rec={rec}
                        rank={rankOffset + index + 1}
                        initialReaction={prior?.reaction ?? null}
                        initialComment={prior?.comment ?? null}
                        onFeedbackChange={onFeedbackChange}
                      />
                    </li>
                  );
                })}
          </ul>

          {error ? (
            <p className="mt-3 text-center text-[13px] text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <PaginationControls
            page={page}
            totalPages={total_pages}
            disabled={pending}
            label="Recommendations pagination"
            onPageChange={goToPage}
          />
        </>
      )}

      <ExcludedDealsPanel
        clientId={clientId}
        excluded={excluded}
        onChanged={() => reload(1)}
      />
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
