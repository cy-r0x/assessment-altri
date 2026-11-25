import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  width?: "list" | "detail";
  className?: string;
};

export function PageShell({ children, width = "list", className }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full pb-10 pt-5",
        width === "list" && "max-w-[1760px] px-5 md:px-8 xl:px-10",
        width === "detail" && "max-w-[1400px] px-6 pb-12 md:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageHeadingProps = {
  title: string;
  description?: string;
  trailing?: ReactNode;
};

export function PageHeading({ title, description, trailing }: PageHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <h1 className="text-[24px] font-medium tracking-tight text-foreground md:text-[26px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[13px] text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

type BackLinkProps = {
  href: string;
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md text-[13px] font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className="inline-flex size-6 items-center justify-center rounded-full bg-surface-muted text-foreground-muted transition-colors group-hover:bg-surface-raised group-hover:text-foreground"
      >
        <ArrowLeft size={14} />
      </span>
      {label}
    </Link>
  );
}
