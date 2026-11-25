"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  label?: string;
  /** Tighter footer for nested cards/tables */
  compact?: boolean;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  label = "Pagination",
  compact = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={
        compact
          ? "flex items-center justify-center gap-2 border-t border-border py-3"
          : "mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
      }
      aria-label={label}
    >
      <PaginationButton
        disabled={disabled || page <= 1}
        label="Previous"
        icon="prev"
        onClick={() => onPageChange(page - 1)}
      />
      <span className="px-2 text-[13px] tabular-nums text-foreground-muted">
        {page} / {totalPages}
      </span>
      <PaginationButton
        disabled={disabled || page >= totalPages}
        label="Next"
        icon="next"
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
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
      {icon === "prev" ? <Icon size={16} aria-hidden /> : null}
      <span>{label}</span>
      {icon === "next" ? <Icon size={16} aria-hidden /> : null}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex min-h-9 items-center gap-1 rounded-[28px] border border-border px-3.5 py-1.5 text-[13px] text-foreground-subtle"
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-[28px] border border-foreground px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-[color,background-color,transform] duration-150 hover:bg-foreground hover:text-primary-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </button>
  );
}
