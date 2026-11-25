import Link from "next/link";

import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { formatFocus } from "@/lib/api";
import type { FeedbackItem, RecommendationsResponse } from "@/lib/types";

type RecommendationListProps = {
  data: RecommendationsResponse;
  feedback?: FeedbackItem[];
};

function latestReactions(feedback: FeedbackItem[] | undefined): Map<string, "up" | "down"> {
  const map = new Map<string, "up" | "down">();
  if (!feedback) return map;
  // Feedback list is newest-first; keep the first reaction per deal.
  for (const item of feedback) {
    if (map.has(item.deal_id)) continue;
    if (item.reaction === "up" || item.reaction === "down") {
      map.set(item.deal_id, item.reaction);
    }
  }
  return map;
}

export function RecommendationList({ data, feedback }: RecommendationListProps) {
  const { recommendations, excluded, main_focus, client_id } = data;
  const reactions = latestReactions(feedback);

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
              <RecommendationCard
                clientId={client_id}
                rec={rec}
                rank={index + 1}
                initialReaction={reactions.get(rec.deal.id) ?? null}
              />
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
