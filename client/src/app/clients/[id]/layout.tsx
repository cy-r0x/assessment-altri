import type { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";

export default function ClientDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      {children}
    </div>
  );
}
