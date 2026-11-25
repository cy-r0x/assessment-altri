import type { ReactNode } from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Home,
  MapPin,
  Percent,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink, PageShell } from "@/components/PageShell";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchClient, fetchRecommendations, formatBudget, formatFocus } from "@/lib/api";
import type { FeedbackItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClientPageProps = {
  params: Promise<{ id: string }>;
};

/** Keep one entry per deal (newest first). */
function latestFeedback(feedback: FeedbackItem[]): FeedbackItem[] {
  const seen = new Set<string>();
  const latest: FeedbackItem[] = [];
  for (const item of feedback) {
    if (seen.has(item.deal_id)) continue;
    seen.add(item.deal_id);
    latest.push(item);
  }
  return latest;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  const [clientSettled, recommendationsSettled] = await Promise.allSettled([
    fetchClient(id),
    fetchRecommendations(id, 1, 6),
  ]);

  if (clientSettled.status === "rejected") {
    notFound();
  }

  const { profile, feedback } = clientSettled.value.data;
  const recommendations =
    recommendationsSettled.status === "fulfilled" ? recommendationsSettled.value : null;
  const activeFeedback = latestFeedback(feedback);
  const budgetLabel = formatBudget(profile.budget);
  const focusLabel = formatFocus(profile.main_focus);
  const flexibilityLabel = titleCase(profile.budget_flexibility);

  return (
    <PageShell width="detail" className="relative">
      <BackLink href="/" label="Clients" />

      <div className="relative mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch">
          <section className="rounded-[14px] border border-border/80 bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-5">
              <ClientAvatar id={profile.id} size="xl" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-medium tracking-tight text-foreground md:text-[26px]">
                  {profile.name ?? "Client"}
                </h1>
                {profile.notes ? (
                  <p className="mt-1.5 max-w-prose text-pretty text-[14px] leading-relaxed text-foreground-muted">
                    {profile.notes}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <MetaTile
                icon={<Wallet size={20} strokeWidth={2} />}
                label="Budget"
                value={budgetLabel}
              />
              <MetaTile
                icon={<Target size={20} strokeWidth={2} />}
                label="Focus"
                value={focusLabel}
              />
              <MetaTile
                icon={<Gauge size={20} strokeWidth={2} />}
                label="Flexibility"
                value={flexibilityLabel}
              />
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Fact icon={<MapPin size={18} />} label="Markets" value={joinList(profile.market_preferences) || "—"} />
              <Fact icon={<MapPin size={18} />} label="Avoid" value={joinList(profile.avoid_markets) || "None"} />
              <Fact icon={<BedDouble size={18} />} label="Min bedrooms" value={String(profile.min_bedrooms ?? "—")} />
              <Fact icon={<Percent size={18} />} label="Down payment" value={pct(profile.down_payment_pct)} />
              <Fact icon={<CircleDollarSign size={18} />} label="Co-host fee" value={pct(profile.cohost_fee_pct)} />
              <Fact icon={<Wrench size={18} />} label="Renovation" value={titleCase(profile.renovation_appetite)} />
              <Fact icon={<Sparkles size={18} />} label="Wow factors" value={joinList(profile.wow_factors) || "—"} />
              <Fact
                icon={<Home size={18} />}
                label="Turnkey"
                value={profile.wants_turnkey == null ? "—" : profile.wants_turnkey ? "Yes" : "No"}
              />
              <Fact
                icon={<CalendarDays size={18} />}
                label="Onboarded"
                value={formatDate(profile.onboarded_at)}
                wide
              />
            </dl>
          </section>

          {/* h-0 min-h-full: match profile column height without letting the list grow the row */}
          <Card className="max-h-[min(36rem,calc(100dvh-10rem))] gap-0 overflow-hidden border-border/80 py-0 shadow-[var(--shadow-card)] lg:h-0 lg:max-h-none lg:min-h-full">
            <CardHeader className="shrink-0 px-5 py-4">
              <CardTitle>Feedback</CardTitle>
              <CardDescription className="text-xs">
                Latest reaction per deal from this client
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {activeFeedback.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No feedback yet.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Like or dislike a recommendation below to capture preference.
                  </p>
                </div>
              ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <ul className="divide-y divide-border">
                    {activeFeedback.map((item) => {
                      const up = item.reaction === "up";
                      const down = item.reaction === "down";
                      const place = [item.deal_city, item.deal_state]
                        .filter(Boolean)
                        .join(", ");
                      const title = item.deal_address || item.deal_id;
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/deals/${item.deal_id}`}
                            className="flex cursor-pointer gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                                up && "bg-success-soft text-success",
                                down && "bg-danger-soft text-danger",
                                !up && !down && "bg-muted text-muted-foreground",
                              )}
                            >
                              {up ? (
                                <ThumbsUp size={14} strokeWidth={2.25} />
                              ) : down ? (
                                <ThumbsDown size={14} strokeWidth={2.25} />
                              ) : null}
                            </span>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium leading-snug text-foreground">
                                    {title}
                                  </p>
                                  {place ? (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                      {place}
                                    </p>
                                  ) : null}
                                </div>
                                <span className="shrink-0 pt-0.5 text-[11px] tabular-nums text-muted-foreground">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>

                              {item.comment ? (
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {item.comment}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="relative mt-8">
          {recommendations ? (
            <RecommendationList
              data={recommendations.data}
              pagination={recommendations.pagination}
              feedback={activeFeedback}
            />
          ) : (
            <div className="rounded-[14px] border border-dashed border-border bg-surface/70 p-5">
              <h2 className="text-[16px] font-medium text-foreground">Recommendations</h2>
              <p className="mt-2 text-[13px] text-foreground-muted" role="alert">
                Couldn&apos;t load recommendations. Try refreshing the page.
              </p>
            </div>
          )}
        </section>
      </PageShell>
  );
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card
      size="sm"
      className="min-h-[4.5rem] flex-row items-center justify-between gap-3 border-0 bg-[#222222] px-4 py-4 text-white ring-0"
    >
      <div className="flex min-w-0 items-center gap-2.5 text-white/70">
        <span className="shrink-0 text-white" aria-hidden>
          {icon}
        </span>
        <span className="truncate text-[12px] tracking-wide">{label}</span>
      </div>
      <p className="shrink-0 text-[16px] font-medium tabular-nums text-white">
        {value}
      </p>
    </Card>
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

function joinList(values: string[] | null | undefined): string {
  if (!values?.length) return "";
  return values.join(" · ");
}

function pct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

function titleCase(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
