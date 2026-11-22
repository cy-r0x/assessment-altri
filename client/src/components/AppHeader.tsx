import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center px-6 md:px-10">
        <Link
          href="/"
          className="text-[18px] font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          STR Search
        </Link>
      </div>
    </header>
  );
}
