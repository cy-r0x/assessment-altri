"use client";

import { useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { dealImageUrl, formatBudget, formatCoc, postFeedback } from "@/lib/api";
import type { Recommendation } from "@/lib/types";

type RecommendationCardProps = {
  clientId: string;
  rec: Recommendation;
  rank: number;
  initialReaction?: "up" | "down" | null;
};

export function RecommendationCard({
  clientId,
  rec,
  rank,
  initialReaction = null,
}: RecommendationCardProps) {
  const router = useRouter();
  const [reaction, setReaction] = useState<"up" | "down" | null>(initialReaction);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { deal, market, metrics } = rec;
  const marketLabel = market.name || [deal.city, deal.state].filter(Boolean).join(", ") || null;
  const setting = market.setting ? titleCase(market.setting) : null;
  const mid = metrics.coc.mid;
  const midTone =
    mid == null
      ? "text-foreground"
      : mid >= 0.08
        ? "text-success"
        : mid >= 0
          ? "text-foreground"
          : "text-danger";

  function submit(next: "up" | "down") {
    if (pending) return;
    const previous = reaction;
    // Same reaction again → optimistic undo; otherwise overwrite/create.
    const optimistic = previous === next ? null : next;
    setReaction(optimistic);
    setError(null);

    startTransition(async () => {
      try {
        const result = await postFeedback({
          client_id: clientId,
          deal_id: deal.id,
          reaction: next,
        });
        if (result.data?.action === "undone") {
          setReaction(null);
        } else if (result.data && "reaction" in result.data) {
          setReaction(result.data.reaction === "down" ? "down" : "up");
        }
        router.refresh();
      } catch {
        setReaction(previous);
        setError("Couldn’t save feedback");
      }
    });
  }

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] w-full bg-surface-muted">
        <Image
          src={dealImageUrl(deal.id)}
          alt={`Photo of ${deal.address ?? deal.id}`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          preload={rank <= 3}
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums ${
            rank === 1
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-foreground shadow-sm"
          }`}
        >
          #{rank}
        </span>

        <div
          className={`absolute right-3 top-3 flex items-center gap-1.5 transition-opacity duration-150 ${
            reaction
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          <FeedbackButton
            label="Like deal"
            active={reaction === "up"}
            pending={pending}
            tone="up"
            onClick={() => submit("up")}
          >
            <ThumbsUp size={14} strokeWidth={2.25} />
          </FeedbackButton>
          <FeedbackButton
            label="Dislike deal"
            active={reaction === "down"}
            pending={pending}
            tone="down"
            onClick={() => submit("down")}
          >
            <ThumbsDown size={14} strokeWidth={2.25} />
          </FeedbackButton>
        </div>

        {error ? (
          <p className="absolute bottom-3 left-3 right-3 rounded-[8px] bg-surface/95 px-2 py-1 text-[11px] text-danger shadow-sm">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {marketLabel ? (
              <span className="min-w-0 truncate text-[13px] text-foreground-muted">
                {marketLabel}
                {setting ? ` · ${setting}` : ""}
              </span>
            ) : null}
            <p className="truncate text-[15px] font-medium text-foreground">
              {deal.address ?? deal.id}
            </p>
            <p className="text-[13px] tabular-nums text-foreground-subtle">
              {deal.id} · {deal.bedrooms ?? "—"} bd · {deal.baths ?? "—"} ba
              {deal.turnkey != null ? ` · ${deal.turnkey ? "Turnkey" : "Needs work"}` : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-medium tabular-nums text-foreground">
              {formatBudget(deal.purchase_price)}
            </p>
            <p className="text-[12px] text-foreground-subtle">list price</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-3">
          <div className="shrink-0">
            <p className={`text-[24px] leading-none font-medium tabular-nums ${midTone}`}>
              {formatCoc(mid)}
            </p>
            <p className="mt-1 text-[12px] text-foreground-muted">Cash-on-cash (mid)</p>
          </div>
          <div className="min-w-0 flex-1">
            <CocRange low={metrics.coc.low} mid={mid} high={metrics.coc.high} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <dt className="text-[12px] text-foreground-muted">Cash needed</dt>
            <dd className="text-[15px] font-medium tabular-nums text-foreground">
              {formatBudget(metrics.cash_needed)}
            </dd>
          </div>
          <div className="min-w-0 border-l border-border pl-3">
            <dt className="text-[12px] text-foreground-muted">Cash flow / yr (mid)</dt>
            <dd
              className={`text-[15px] font-medium tabular-nums ${
                metrics.cash_flow.mid < 0 ? "text-danger" : "text-foreground"
              }`}
            >
              {formatBudget(metrics.cash_flow.mid)}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}

function FeedbackButton({
  children,
  label,
  active,
  pending,
  tone,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active: boolean;
  pending: boolean;
  tone: "up" | "down";
  onClick: () => void;
}) {
  const activeClass =
    tone === "up"
      ? "bg-success text-primary-foreground"
      : "bg-danger text-primary-foreground";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={`inline-flex size-8 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
        active ? activeClass : "bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

const SCALE_MIN = 0;
const SCALE_MAX = 0.3;

function scalePos(value: number): number {
  const ratio = (value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
  return Math.min(1, Math.max(0, ratio)) * 100;
}

function CocRange({
  low,
  mid,
  high,
}: {
  low: number | null;
  mid: number | null;
  high: number | null;
}) {
  const labels = (
    <div className="flex justify-between gap-2 text-[12px] tabular-nums text-foreground-muted">
      <span className={low != null && low < 0 ? "text-danger" : undefined}>
        Low {formatCoc(low)}
      </span>
      <span>High {formatCoc(high)}</span>
    </div>
  );

  if (low == null || mid == null || high == null) return labels;

  const lowPos = scalePos(low);
  const highPos = scalePos(high);

  return (
    <div
      role="img"
      aria-label={`CoC range low ${formatCoc(low)}, mid ${formatCoc(mid)}, high ${formatCoc(high)}`}
      className="flex flex-col gap-1.5"
    >
      <div className="relative h-1.5 rounded-full bg-surface-muted">
        <span
          className="absolute inset-y-0 rounded-full bg-foreground/25"
          style={{ left: `${lowPos}%`, width: `${Math.max(0, highPos - lowPos)}%` }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-surface"
          style={{ left: `${scalePos(mid)}%` }}
        />
      </div>
      {labels}
    </div>
  );
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
