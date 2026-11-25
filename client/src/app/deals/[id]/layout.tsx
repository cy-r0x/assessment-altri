import type { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";

export default function DealDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      {children}
    </div>
  );
}
