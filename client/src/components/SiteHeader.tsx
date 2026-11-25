import Link from "next/link";

import { BrandMark } from "@/components/BrandMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center px-6 md:px-10">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2.5 rounded-md text-[18px] font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandMark className="size-7 shrink-0" />
          STR Search
        </Link>
      </div>
    </header>
  );
}
