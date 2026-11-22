import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  Home,
  MapPin,
  Percent,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { fetchClient, formatBudget, formatFocus } from "@/lib/api";

type ClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  let result;
  try {
    result = await fetchClient(id);
  } catch {
    notFound();
  }

  const { profile, feedback } = result.data;
  const ups = feedback.filter((f) => f.reaction === "up").length;
  const downs = feedback.filter((f) => f.reaction === "down").length;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <main className="mx-auto w-full max-w-[1100px] px-5 pb-14 pt-5 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Clients
        </Link>

        {/* Profile sets height; feedback locks to that height and scrolls */}
        <div className="relative mt-4 grid grid-cols-1 gap-4 lg:grid-cols-1 lg:pr-[calc(22rem+1rem)]">
          <section className="rounded-[12px] border border-border bg-surface p-5">
            <div className="flex items-start gap-4">
              <ClientAvatar id={profile.id} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-medium tracking-tight text-foreground">
                  {profile.name ?? "Client"}
                </h1>
                <p className="mt-1 text-[14px] text-foreground-muted">
                  <span className="font-medium tabular-nums text-foreground">
                    {formatBudget(profile.budget)}
                  </span>
                  <span> · </span>
                  <span className="capitalize">{formatFocus(profile.main_focus)}</span>
                  <span> · </span>
                  <span className="capitalize">{profile.budget_flexibility ?? "—"}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                  <Chip icon={<ThumbsUp size={12} />} label={`${ups} up`} tone="success" />
                  <Chip icon={<ThumbsDown size={12} />} label={`${downs} down`} tone="danger" />
                </div>
              </div>
            </div>

            {profile.notes ? (
              <p className="mt-4 text-pretty text-[14px] leading-relaxed text-foreground-muted">
                {profile.notes}
              </p>
            ) : null}

            <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Fact icon={<MapPin size={14} />} label="Markets" value={joinList(profile.market_preferences) || "—"} />
              <Fact icon={<MapPin size={14} />} label="Avoid" value={joinList(profile.avoid_markets) || "None"} />
              <Fact icon={<BedDouble size={14} />} label="Min bedrooms" value={String(profile.min_bedrooms ?? "—")} />
              <Fact icon={<Percent size={14} />} label="Down payment" value={pct(profile.down_payment_pct)} />
              <Fact icon={<CircleDollarSign size={14} />} label="Co-host fee" value={pct(profile.cohost_fee_pct)} />
              <Fact icon={<Wrench size={14} />} label="Renovation" value={profile.renovation_appetite ?? "—"} />
              <Fact icon={<Sparkles size={14} />} label="Wow factors" value={joinList(profile.wow_factors) || "—"} />
              <Fact
                icon={<Home size={14} />}
                label="Turnkey"
                value={profile.wants_turnkey == null ? "—" : profile.wants_turnkey ? "Yes" : "No"}
              />
              <Fact icon={<CalendarDays size={14} />} label="Onboarded" value={profile.onboarded_at ?? "—"} />
            </dl>
          </section>

          <aside className="flex max-h-[28rem] flex-col rounded-[12px] border border-border bg-surface p-4 lg:absolute lg:inset-y-0 lg:right-0 lg:max-h-none lg:w-[22rem]">
            <div className="flex shrink-0 items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-medium text-foreground">Feedback</h2>
              <span className="text-[12px] tabular-nums text-foreground-muted">
                {feedback.length}
              </span>
            </div>

            {feedback.length === 0 ? (
              <p className="mt-4 text-[13px] text-foreground-muted">No feedback yet.</p>
            ) : (
              <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {feedback.map((item) => {
                  const up = item.reaction === "up";
                  const down = item.reaction === "down";
                  return (
                    <li
                      key={item.id}
                      className="rounded-[10px] border border-border bg-surface-muted/60 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        {up ? (
                          <ThumbsUp size={14} className="shrink-0 text-success" />
                        ) : down ? (
                          <ThumbsDown size={14} className="shrink-0 text-danger" />
                        ) : null}
                        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                          {item.deal_id}
                        </p>
                        <span className="shrink-0 text-[11px] tabular-nums text-foreground-subtle">
                          {item.created_at ?? ""}
                        </span>
                      </div>
                      {item.comment ? (
                        <p className="mt-1.5 text-pretty text-[13px] leading-snug text-foreground-muted">
                          {item.comment}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function Chip({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: "success" | "danger";
}) {
  const styles =
    tone === "success"
      ? "bg-success-soft text-success"
      : "bg-danger-soft text-danger";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${styles}`}>
      {icon}
      {label}
    </span>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] bg-surface-muted/70 px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted [&>svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] text-foreground-muted">{label}</dt>
        <dd className="truncate text-[13px] capitalize text-foreground">{value}</dd>
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
