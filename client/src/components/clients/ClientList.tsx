import Link from "next/link";
import { BedDouble, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { formatBudget, formatFocus } from "@/lib/api";
import type { ClientSummary, Pagination } from "@/lib/types";

type ClientListProps = {
  clients: ClientSummary[];
  pagination: Pagination;
};

export function ClientList({ clients, pagination }: ClientListProps) {
  const { page, total_pages, total } = pagination;

  return (
    <div className="mx-auto w-full max-w-[960px] px-6 pb-14 pt-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-[26px] font-medium tracking-tight text-foreground md:text-[28px]">
          Clients
        </h1>
        <p className="mt-1 text-[14px] text-foreground-muted">
          {total} investors · pick one to review deals
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <li key={client.id}>
            <Link
              href={`/clients/${client.id}`}
              className="flex items-center gap-3 rounded-[12px] border border-border bg-surface p-3.5 transition-shadow hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ClientAvatar id={client.id} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-foreground">
                  {client.name ?? "Client"}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-foreground-muted">
                  <span className="font-medium tabular-nums text-foreground">
                    {formatBudget(client.budget)}
                  </span>
                  <span> · </span>
                  <span className="capitalize">{formatFocus(client.main_focus)}</span>
                </p>
                <p className="mt-1 flex items-center gap-2 truncate text-[12px] text-foreground-subtle">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">
                    {client.market_preferences?.length
                      ? client.market_preferences.slice(0, 2).join(", ")
                      : "Open markets"}
                  </span>
                  <BedDouble size={12} className="ml-auto shrink-0" />
                  <span className="tabular-nums">{client.min_bedrooms ?? "—"}+</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        <PaginationLink page={page - 1} disabled={page <= 1} label="Previous" icon="prev" />
        <span className="px-3 text-[13px] tabular-nums text-foreground-muted">
          {page} / {total_pages}
        </span>
        <PaginationLink page={page + 1} disabled={page >= total_pages} label="Next" icon="next" />
      </nav>
    </div>
  );
}

function PaginationLink({
  page,
  disabled,
  label,
  icon,
}: {
  page: number;
  disabled: boolean;
  label: string;
  icon: "prev" | "next";
}) {
  const Icon = icon === "prev" ? ChevronLeft : ChevronRight;
  const content = (
    <>
      {icon === "prev" ? <Icon size={16} /> : null}
      <span>{label}</span>
      {icon === "next" ? <Icon size={16} /> : null}
    </>
  );

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[28px] border border-border px-3 py-1.5 text-[13px] text-foreground-subtle">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={`/?page=${page}`}
      className="inline-flex items-center gap-1 rounded-[28px] border border-foreground px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
