import Link from "next/link";

import { AppNav } from "@/components/AppNav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/80 bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto flex h-full w-full max-w-[1760px] items-center px-6 md:px-10">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(255,56,92,0.18)] transition-transform duration-150 group-hover:scale-110"
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
