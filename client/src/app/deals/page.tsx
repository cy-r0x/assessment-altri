import { Suspense } from "react";

import { AppHeader } from "@/components/AppHeader";
import { DealsPageSkeleton } from "@/components/deals/DealList";
import { DealsMaster } from "@/components/deals/DealsMaster";

export default function DealsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <Suspense fallback={<DealsPageSkeleton />}>
        <DealsMaster page={1} />
      </Suspense>
    </div>
  );
}
