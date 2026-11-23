import { Suspense } from "react";

import { AppHeader } from "@/components/AppHeader";
import { DealsMaster } from "@/components/deals/DealsMaster";

type DealsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default function DealsPage({ searchParams }: DealsPageProps) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1760px] px-6 py-10 text-[15px] text-foreground-muted md:px-10">
            Loading deals…
          </div>
        }
      >
        <DealsPane searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DealsPane({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return <DealsMaster page={page} />;
}
