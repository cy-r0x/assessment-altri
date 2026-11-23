import Link from "next/link";

import { AppNav } from "@/components/AppNav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center px-6 md:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(255,56,92,0.18)] transition-transform group-hover:scale-110"
          />
          <span className="text-[18px] font-medium tracking-tight text-foreground">
            STR Search
          </span>
        </Link>
        <AppNav />
      </div>
    </header>
  );
}
