import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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

import { AppHeader } from "@/components/AppHeader";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchClient, fetchRecommendations, formatBudget, formatFocus } from "@/lib/api";
import type { FeedbackItem } from "@/lib/types";

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
    fetchRecommendations(id),
  ]);

  if (clientSettled.status === "rejected") {
    notFound();
  }

  const { profile, feedback } = clientSettled.value.data;
  const recommendations =
    recommendationsSettled.status === "fulfilled" ? recommendationsSettled.value.data : null;
  const activeFeedback = latestFeedback(feedback);
  const budgetLabel = formatBudget(profile.budget);
  const focusLabel = formatFocus(profile.main_focus);
  const flexibilityLabel = titleCase(profile.budget_flexibility);

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <main className="relative mx-auto w-full max-w-[1400px] px-6 pb-12 pt-5 md:px-10">
        <Link
          href="/"
          className="relative inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Clients
        </Link>

        <div className="relative mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch">
          <section className="rounded-[14px] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-5">
              <ClientAvatar id={profile.id} size="xl" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-medium tracking-tight text-foreground">
                  {profile.name ?? "Client"}
                </h1>
                {profile.notes ? (
                  <p className="mt-1.5 text-pretty text-[14px] leading-relaxed text-foreground-muted">
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
          <Card className="max-h-[min(36rem,calc(100dvh-10rem))] gap-0 overflow-hidden py-0 lg:h-0 lg:max-h-none lg:min-h-full">
            <CardHeader className="shrink-0 px-5 py-4">
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {activeFeedback.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">No feedback yet.</p>
              ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <ul className="space-y-2 px-5 py-4">
                    {activeFeedback.map((item) => {
                      const up = item.reaction === "up";
                      const down = item.reaction === "down";
                      return (
                        <li key={item.id}>
                          <Card
                            size="sm"
                            className="gap-1.5 border-border bg-muted py-3 shadow-none ring-1 ring-border"
                          >
                            <div className="flex items-center gap-2 px-(--card-spacing)">
                              {up ? (
                                <ThumbsUp
                                  size={14}
                                  className="shrink-0 text-success"
                                  strokeWidth={2}
                                />
                              ) : down ? (
                                <ThumbsDown
                                  size={14}
                                  className="shrink-0 text-danger"
                                  strokeWidth={2}
                                />
                              ) : null}
                              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                {item.deal_id}
                              </p>
                              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <p className="truncate px-(--card-spacing) text-sm text-muted-foreground">
                              {item.comment || "No comment"}
                            </p>
                          </Card>
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
            <RecommendationList data={recommendations} feedback={activeFeedback} />
          ) : (
            <div className="rounded-[14px] border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h2 className="text-[16px] font-medium text-foreground">Recommendations</h2>
              <p className="mt-2 text-[13px] text-foreground-muted">
                Couldn&apos;t load recommendations
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
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
        <span className="shrink-0 text-white">{icon}</span>
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
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
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
