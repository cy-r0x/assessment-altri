"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  Home,
  Info,
  MapPin,
  MessageSquarePlus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dealImageUrl, formatBudget, formatCoc, postFeedback } from "@/lib/api";
import type { Recommendation } from "@/lib/types";

type RecommendationCardProps = {
  clientId: string;
  rec: Recommendation;
  rank: number;
  initialReaction?: "up" | "down" | null;
  initialComment?: string | null;
};

export function RecommendationCard({
  clientId,
  rec,
  rank,
  initialReaction = null,
  initialComment = null,
}: RecommendationCardProps) {
  const router = useRouter();
  const commentFieldId = useId();
  const [reaction, setReaction] = useState<"up" | "down" | null>(initialReaction);
  const [savedComment, setSavedComment] = useState<string | null>(initialComment);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [draftReaction, setDraftReaction] = useState<"up" | "down" | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const { deal, market, metrics, explanation } = rec;
  const location =
    market.name || [deal.city, deal.state].filter(Boolean).join(", ") || "—";
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

  const activeReaction = composerOpen ? draftReaction : reaction;

  function openComposer(next: "up" | "down", seedComment?: string | null) {
    setDraftReaction(next);
    setCommentDraft(seedComment ?? "");
    setComposerOpen(true);
    setError(null);
  }

  function closeComposer() {
    setComposerOpen(false);
    setDraftReaction(null);
    setCommentDraft("");
  }

  function onThumb(next: "up" | "down") {
    if (pending) return;

    // Same saved reaction again → undo immediately.
    if (!composerOpen && reaction === next) {
      persist(next, null, { undo: true });
      return;
    }

    // Switching draft thumbs while composer is open.
    if (composerOpen) {
      setDraftReaction(next);
      return;
    }

    openComposer(next, reaction === next ? savedComment : "");
  }

  function onEditComment() {
    if (pending || !reaction) return;
    openComposer(reaction, savedComment);
  }

  function persist(
    next: "up" | "down",
    comment: string | null,
    opts?: { undo?: boolean },
  ) {
    const previousReaction = reaction;
    const previousComment = savedComment;
    const trimmed = comment?.trim() || null;

    if (opts?.undo) {
      setReaction(null);
      setSavedComment(null);
      closeComposer();
    } else {
      setReaction(next);
      setSavedComment(trimmed);
      closeComposer();
    }
    setError(null);

    startTransition(async () => {
      try {
        const payload = opts?.undo
          ? {
              client_id: clientId,
              deal_id: deal.id,
              reaction: next,
            }
          : {
              client_id: clientId,
              deal_id: deal.id,
              reaction: next,
              comment: trimmed,
            };
        const result = await postFeedback(payload);
        if (result.data?.action === "undone") {
          setReaction(null);
          setSavedComment(null);
        } else if (result.data && "reaction" in result.data) {
          setReaction(result.data.reaction === "down" ? "down" : "up");
          setSavedComment(result.data.comment ?? null);
        }
        router.refresh();
      } catch {
        setReaction(previousReaction);
        setSavedComment(previousComment);
        setError("Couldn’t save feedback");
      }
    });
  }

  function saveComposer() {
    if (!draftReaction || pending) return;
    persist(draftReaction, commentDraft);
  }

  return (
    <div className="card-interactive group relative flex h-full flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)]">
      <Link
        href={`/deals/${deal.id}`}
        className="flex min-h-0 flex-1 cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
          <Image
            src={dealImageUrl(deal.id)}
            alt={`Photo of ${deal.address ?? deal.id}`}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
            preload={rank <= 3}
            loading={rank <= 3 ? "eager" : "lazy"}
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

          <span className="absolute bottom-3 right-3 rounded-[8px] bg-foreground/90 px-2.5 py-1 text-[15px] font-medium tabular-nums text-primary-foreground">
            {formatBudget(deal.purchase_price)}
          </span>

          {error ? (
            <p
              className="absolute bottom-3 left-3 max-w-[55%] rounded-[8px] bg-surface/95 px-2 py-1 text-[11px] text-danger shadow-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-3">
          <p className="truncate text-[16px] font-medium text-foreground">
            {deal.address ?? "Deal"}
          </p>
          <p className="flex items-center gap-1.5 text-[13px] text-foreground-muted">
            <MapPin size={14} className="shrink-0" aria-hidden />
            <span className="truncate">
              {location}
              {setting ? ` · ${setting}` : ""}
            </span>
          </p>

          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
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

          <dl className="mt-3 grid grid-cols-2 gap-3">
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

          {explanation ? (
            <div className="mt-3 flex gap-2.5 rounded-[10px] bg-surface-muted/90 px-3 py-2.5">
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
              >
                <Info size={12} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-foreground-subtle uppercase">
                  Why this deal
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-foreground">
                  {explanation}
                </p>
              </div>
            </div>
          ) : null}

          <dl className="mt-3 grid grid-cols-3 divide-x divide-border border-t border-border pt-3">
            <Spec icon={<BedDouble size={14} aria-hidden />} label="Beds" value={deal.bedrooms} />
            <Spec icon={<Bath size={14} aria-hidden />} label="Baths" value={deal.baths} />
            <Spec
              icon={<Home size={14} aria-hidden />}
              label="Status"
              value={
                deal.turnkey == null ? "—" : deal.turnkey ? "Turnkey" : "Needs work"
              }
            />
          </dl>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        <FeedbackButton
          label="Like deal"
          active={activeReaction === "up"}
          pending={pending}
          tone="up"
          onClick={() => onThumb("up")}
        >
          <ThumbsUp size={14} strokeWidth={2.25} />
        </FeedbackButton>
        <FeedbackButton
          label="Dislike deal"
          active={activeReaction === "down"}
          pending={pending}
          tone="down"
          onClick={() => onThumb("down")}
        >
          <ThumbsDown size={14} strokeWidth={2.25} />
        </FeedbackButton>
      </div>

      <Dialog
        open={composerOpen}
        onOpenChange={(open) => {
          if (!open && !pending) closeComposer();
        }}
      >
        <DialogContent
          className="gap-0 overflow-hidden p-0 sm:max-w-[420px]"
          showCloseButton={!pending}
        >
          <DialogHeader className="space-y-1 border-b border-border px-5 py-4 pr-12 text-left">
            <DialogTitle className="text-[18px] tracking-tight">
              Record feedback
            </DialogTitle>
            <DialogDescription className="text-[13px] text-foreground-muted">
              <span className="font-medium text-foreground">
                {deal.address ?? deal.id}
              </span>
              {location !== "—" ? (
                <span className="text-foreground-muted"> · {location}</span>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-5 py-4">
            <fieldset className="space-y-2" disabled={pending}>
              <legend className="text-[13px] font-medium text-foreground">
                Your reaction
              </legend>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label="Reaction"
              >
                <ReactionChoice
                  active={draftReaction === "up"}
                  tone="up"
                  label="Thumbs up"
                  pending={pending}
                  onClick={() => setDraftReaction("up")}
                />
                <ReactionChoice
                  active={draftReaction === "down"}
                  tone="down"
                  label="Thumbs down"
                  pending={pending}
                  onClick={() => setDraftReaction("down")}
                />
              </div>
            </fieldset>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor={commentFieldId}
                  className="text-[13px] font-medium text-foreground"
                >
                  Comment{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <span
                  id={`${commentFieldId}-count`}
                  className="text-[11px] tabular-nums text-muted-foreground"
                >
                  {commentDraft.length}/280
                </span>
              </div>
              <textarea
                id={commentFieldId}
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                rows={4}
                maxLength={280}
                autoFocus
                placeholder="What should the next review know?"
                disabled={pending}
                aria-describedby={`${commentFieldId}-count ${commentFieldId}-hint`}
                className="w-full resize-none rounded-[12px] border border-border bg-surface px-3.5 py-3 text-[14px] leading-relaxed text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow] placeholder:text-foreground-subtle focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
              />
            </div>

            <p
              id={`${commentFieldId}-hint`}
              className="flex gap-2 rounded-[10px] bg-surface-muted/90 px-3 py-2.5 text-[12px] leading-snug text-foreground-muted"
            >
              <Info
                size={14}
                strokeWidth={2.25}
                className="mt-0.5 shrink-0 text-foreground"
                aria-hidden
              />
              <span>
                Tip: tap the same thumb on the card later to remove this reaction.
              </span>
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/60 px-5 py-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={closeComposer}
              className="min-h-9 cursor-pointer rounded-[20px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !draftReaction}
              onClick={saveComposer}
              className="min-h-9 cursor-pointer rounded-[20px] bg-foreground text-primary-foreground hover:bg-foreground/90"
            >
              {pending
                ? "Saving…"
                : commentDraft.trim()
                  ? "Save with note"
                  : "Save reaction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!composerOpen && reaction ? (
        <div className="border-t border-border px-4 py-2.5">
          {savedComment ? (
            <p className="line-clamp-2 text-[12px] leading-snug text-foreground-muted">
              <span className="font-medium text-foreground">Your note · </span>
              {savedComment}
            </p>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={onEditComment}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <MessageSquarePlus size={13} aria-hidden />
              Add a comment
            </button>
          )}
          {savedComment ? (
            <button
              type="button"
              disabled={pending}
              onClick={onEditComment}
              className="mt-1 inline-flex cursor-pointer text-[12px] font-medium text-foreground-muted underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              Edit note
            </button>
          ) : null}
        </div>
      ) : null}
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
  value: string | number | null;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 text-center">
      <dd className="text-[16px] font-medium tabular-nums text-foreground">{value ?? "—"}</dd>
      <dt className="inline-flex items-center gap-1 text-[12px] text-foreground-muted">
        {icon}
        {label}
      </dt>
    </div>
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
      className={`inline-flex size-9 min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? activeClass : "bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ReactionChoice({
  active,
  tone,
  label,
  pending,
  onClick,
}: {
  active: boolean;
  tone: "up" | "down";
  label: string;
  pending: boolean;
  onClick: () => void;
}) {
  const Icon = tone === "up" ? ThumbsUp : ThumbsDown;
  const activeClass =
    tone === "up"
      ? "border-success bg-success-soft text-success ring-success/30"
      : "border-danger bg-danger-soft text-danger ring-danger/30";

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={pending}
      onClick={onClick}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] border px-3 text-[13px] font-medium transition-[background-color,border-color,box-shadow,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? `${activeClass} ring-2`
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      <Icon size={15} strokeWidth={2.25} aria-hidden />
      {label}
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
