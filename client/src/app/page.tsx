import { Suspense } from "react";

import { AppHeader } from "@/components/AppHeader";
import { ClientsMaster } from "@/components/clients/ClientsMaster";

type HomeProps = {
  searchParams: Promise<{ page?: string }>;
};

export default function Home({ searchParams }: HomeProps) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1120px] px-6 py-16 text-[15px] text-foreground-muted">
            Loading clients…
          </div>
        }
      >
        <ClientsPane searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ClientsPane({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return <ClientsMaster page={page} />;
}
