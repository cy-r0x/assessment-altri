"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { PageHeading, PageShell } from "@/components/PageShell";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchClients, formatBudget, formatFocus } from "@/lib/api";
import type { ClientSummary, Pagination } from "@/lib/types";

const PAGE_SIZE = 12;

type ClientListProps = {
  clients: ClientSummary[];
  pagination: Pagination;
};

function clientBudgetLabel(client: ClientSummary): string {
  if (client.budget_range) return client.budget_range;
  return formatBudget(client.budget);
}

export function ClientList({
  clients: initialClients,
  pagination: initialPagination,
}: ClientListProps) {
  const [clients, setClients] = useState(initialClients);
  const [pagination, setPagination] = useState(initialPagination);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { page, total_pages, total } = pagination;

  function goToPage(nextPage: number) {
    if (pending || nextPage < 1 || nextPage > total_pages || nextPage === page) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchClients(nextPage, PAGE_SIZE);
        setClients(result.data);
        setPagination(result.pagination);
      } catch {
        setError("Couldn’t load clients");
      }
    });
  }

  return (
    <PageShell>
      <PageHeading
        title="Clients"
        description="Open a client to review profile, feedback, and matched deals."
        trailing={
          total != null ? (
            <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium tabular-nums text-foreground-muted shadow-[inset_0_0_0_1px_var(--border)]">
              {total}
            </span>
          ) : null
        }
      />

      {clients.length === 0 && !pending ? (
        <EmptyState message="No clients yet." />
      ) : (
        <ul
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          aria-busy={pending}
        >
          {pending
            ? Array.from({ length: PAGE_SIZE }, (_, index) => (
                <li key={`skeleton-${index}`}>
                  <ClientCardSkeleton />
                </li>
              ))
            : clients.map((client) => {
                const markets = client.market_preferences?.length
                  ? client.market_preferences.join(" · ")
                  : "Open markets";

                return (
                  <li key={client.id}>
                    <Link
                      href={`/clients/${client.id}`}
                      className="card-interactive flex h-full cursor-pointer items-center gap-4 rounded-[14px] border border-border bg-surface px-3.5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                          <MapPin size={13} className="shrink-0" aria-hidden />
                          <span className="truncate">{markets}</span>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
        </ul>
      )}

      {error ? (
        <p className="mt-3 text-center text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <PaginationControls
        page={page}
        totalPages={total_pages}
        disabled={pending}
        onPageChange={goToPage}
      />
    </PageShell>
  );
}

export function ClientsPageSkeleton() {
  return (
    <PageShell>
      <div className="mb-5 border-b border-border pb-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-2 h-3.5 w-64" />
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <li key={`page-skeleton-${index}`}>
            <ClientCardSkeleton />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-border bg-surface/70 px-6 py-14 text-center">
      <p className="text-[14px] text-foreground-muted">{message}</p>
    </div>
  );
}

function ClientCardSkeleton() {
  return (
    <div
      className="flex h-full items-center gap-4 rounded-[14px] border border-border bg-surface px-3.5 py-3.5"
      aria-hidden
    >
      <Skeleton className="size-24 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-40" />
      </div>
    </div>
  );
}
