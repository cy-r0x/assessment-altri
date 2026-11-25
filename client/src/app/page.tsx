import { Suspense } from "react";

import { AppHeader } from "@/components/AppHeader";
import { ClientsPageSkeleton } from "@/components/clients/ClientList";
import { ClientsMaster } from "@/components/clients/ClientsMaster";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <Suspense fallback={<ClientsPageSkeleton />}>
        <ClientsMaster page={1} />
      </Suspense>
    </div>
  );
}
