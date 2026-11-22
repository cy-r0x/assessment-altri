import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";

export default function ClientNotFound() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1120px] px-6 py-20 md:px-10">
        <h1 className="text-[28px] font-medium text-foreground">Client not found</h1>
        <p className="mt-2 text-[15px] text-foreground-muted">
          That investor is not in the current list.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-[28px] bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Back to clients
        </Link>
      </main>
    </div>
  );
}
