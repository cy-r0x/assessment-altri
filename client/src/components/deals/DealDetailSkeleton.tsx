import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

export function DealDetailSkeleton() {
  return (
    <PageShell width="detail" aria-busy>
      <div aria-hidden>
        <Skeleton className="h-9 w-20 rounded-md" />

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch">
          <section className="rounded-[14px] border border-border/80 bg-surface p-6 shadow-[var(--shadow-card)]">
            <Skeleton className="mb-5 aspect-[2/1] w-full rounded-[12px]" />

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-7 w-56 md:h-8" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-10 w-28 rounded-[10px]" />
            </div>

            <Skeleton className="mt-4 h-16 w-full rounded-[10px]" />

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 9 }, (_, i) => (
                <Skeleton
                  key={`fact-${i}`}
                  className={`h-[3.75rem] w-full rounded-[10px] ${i === 8 ? "sm:col-span-2" : ""}`}
                />
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full rounded-[10px]" />
              <Skeleton className="h-10 w-full rounded-[10px]" />
              <Skeleton className="h-10 w-5/6 rounded-[10px]" />
            </div>
          </section>

          <aside className="flex min-h-[22rem] flex-col gap-5 lg:min-h-full">
            <section className="rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-5 w-20" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={`rev-${i}`} className="h-16 w-full rounded-[10px]" />
                ))}
              </div>
            </section>

            <section className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={`setup-${i}`} className="h-11 w-full rounded-[10px]" />
                ))}
              </div>
            </section>

            <section className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-5 w-16" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={`comp-${i}`} className="h-14 w-full rounded-[10px]" />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
