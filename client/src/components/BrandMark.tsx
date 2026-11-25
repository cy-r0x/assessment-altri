/** Compact STR Search mark — geometric tile + search glyph (Swiss/minimal). */
export function BrandMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <circle
        cx="14"
        cy="14"
        r="5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        className="text-primary-foreground"
      />
      <path
        d="M18.2 18.2 23 23"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        className="text-primary-foreground"
      />
    </svg>
  );
}
