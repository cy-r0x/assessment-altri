import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { formatBudget, formatFocus } from "@/lib/api";
import type { ClientSummary, Pagination } from "@/lib/types";

type ClientListProps = {
  clients: ClientSummary[];
  pagination: Pagination;
};

function clientBudgetLabel(client: ClientSummary): string {
  if (client.budget_range) return client.budget_range;
  return formatBudget(client.budget);
}

export function ClientList({ clients, pagination }: ClientListProps) {
  const { page, total_pages } = pagination;

  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-4 md:px-8 xl:px-10">
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-[24px] font-medium tracking-tight text-foreground md:text-[26px]">
          Clients
        </h1>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => {
          const markets = client.market_preferences?.length
            ? client.market_preferences.join(" · ")
            : "Open markets";

          return (
            <li key={client.id}>
              <Link
                href={`/clients/${client.id}`}
                className="flex h-full items-center gap-4 rounded-[14px] border border-border bg-surface px-3.5 py-3.5 transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ClientAvatar id={client.id} size="xl" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[15px] font-medium text-foreground">
                      {client.name ?? "Client"}
                    </p>
                    <p className="shrink-0 text-[15px] font-medium tabular-nums text-foreground">
                      {clientBudgetLabel(client)}
                    </p>
                  </div>
                  <p className="text-[13px] text-foreground-muted">
                    {formatFocus(client.main_focus)}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] text-foreground-subtle">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{markets}</span>
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <nav
        className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4"
        aria-label="Pagination"
      >
        <PaginationLink
          page={page - 1}
          disabled={page <= 1}
          label="Previous"
          icon="prev"
        />
        <span className="px-2 text-[13px] tabular-nums text-foreground-muted">
          {page} / {total_pages}
        </span>
        <PaginationLink
          page={page + 1}
          disabled={page >= total_pages}
          label="Next"
          icon="next"
        />
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
