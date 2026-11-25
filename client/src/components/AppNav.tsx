"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Clients", match: (path: string) => path === "/" || path.startsWith("/clients") },
  { href: "/deals", label: "Deals", match: (path: string) => path.startsWith("/deals") },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="ml-8 flex items-center gap-1" aria-label="Primary">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`cursor-pointer rounded-[8px] px-3 py-1.5 text-[14px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              active
                ? "bg-surface-muted text-foreground"
                : "text-foreground-muted hover:bg-surface-muted/70 hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
