import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { BrandMark } from "@/components/BrandMark";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/80 bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto flex h-full w-full max-w-[1760px] items-center px-6 md:px-10">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandMark className="size-7 shrink-0 transition-transform duration-150 motion-safe:group-hover:scale-[1.04]" />
          <span className="text-[18px] font-medium tracking-tight text-foreground">
            STR Search
          </span>
        </Link>
        <AppNav />
      </div>
    </header>
  );
}
