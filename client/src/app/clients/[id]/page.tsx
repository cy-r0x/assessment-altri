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

      <main className="relative mx-auto w-full max-w-[1400px] px-6 pb-12 pt-5 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(255,56,92,0.06),_transparent_60%)]"
        />

        <Link
          href="/"
          className="relative inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Clients
        </Link>

        <div className="relative mt-4 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <section className="rounded-[14px] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
                  <span>{formatFocus(profile.main_focus)}</span>
                  <span> · </span>
                  <span>{titleCase(profile.budget_flexibility)}</span>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[12px]">
                  <Chip icon={<ThumbsUp size={12} />} label={`${ups} up`} tone="success" />
                  <Chip icon={<ThumbsDown size={12} />} label={`${downs} down`} tone="danger" />
                </div>
              </div>
            </div>

            {profile.notes ? (
              <p className="mt-4 border-t border-border pt-4 text-pretty text-[14px] leading-relaxed text-foreground-muted">
                {profile.notes}
              </p>
            ) : null}

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

          <aside className="flex max-h-[min(28rem,70dvh)] flex-col overflow-hidden rounded-[14px] border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)]">
            <div className="flex shrink-0 items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-medium text-foreground">Feedback</h2>
              <span className="text-[12px] tabular-nums text-foreground-muted">
                {feedback.length}
              </span>
            </div>

            {feedback.length === 0 ? (
              <p className="mt-4 text-[13px] text-foreground-muted">No feedback yet.</p>
            ) : (
              <ul className="mt-3 min-h-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {feedback.map((item) => {
                  const up = item.reaction === "up";
                  const down = item.reaction === "down";
                  return (
                    <li
                      key={item.id}
                      className="rounded-[10px] border border-border bg-surface-muted/80 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        {up ? (
                          <ThumbsUp size={14} className="shrink-0 text-success" strokeWidth={2} />
                        ) : down ? (
                          <ThumbsDown size={14} className="shrink-0 text-danger" strokeWidth={2} />
                        ) : null}
                        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                          {item.deal_id}
                        </p>
                        <span className="shrink-0 text-[11px] tabular-nums text-foreground-subtle">
                          {formatDate(item.created_at)}
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${styles}`}>
      {icon}
      {label}
    </span>
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
