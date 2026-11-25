import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailSkeleton() {
  return (
    <PageShell width="detail" className="relative" aria-busy>
      <div aria-hidden>
        <Skeleton className="h-9 w-24 rounded-md" />

        <div className="relative mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch">
          <section className="rounded-[14px] border border-border/80 bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-5">
              <Skeleton className="size-24 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-3/4 max-w-sm" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={`meta-${i}`} className="h-[4.5rem] w-full rounded-xl" />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 9 }, (_, i) => (
                <Skeleton
                  key={`fact-${i}`}
                  className={`h-[3.75rem] w-full rounded-[10px] ${i === 8 ? "sm:col-span-2" : ""}`}
                />
              ))}
            </div>
          </section>

          <section className="flex min-h-[22rem] flex-col overflow-hidden rounded-[14px] border border-border/80 bg-surface shadow-[var(--shadow-card)] lg:min-h-full">
            <div className="space-y-2 border-b border-border px-5 py-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <ul className="divide-y divide-border">
              {Array.from({ length: 5 }, (_, i) => (
                <li key={`fb-${i}`} className="flex gap-3 px-5 py-3.5">
                  <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-3 w-14 shrink-0" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="relative mt-8">
          <div className="mb-5 text-center">
            <Skeleton className="mx-auto h-8 w-56 md:h-9" />
            <Skeleton className="mx-auto mt-2.5 h-3.5 w-72" />
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={`rec-${i}`}>
                <RecommendationCardSkeleton />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}

function RecommendationCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-3 flex items-end gap-4 border-t border-border pt-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2 border-l border-border pl-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
          <Skeleton className="mx-auto h-10 w-12" />
        </div>
      </div>
    </div>
  );
}
