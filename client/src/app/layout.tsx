import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STR Search",
  description: "Client deal recommendations for STR Search acquisitions reps",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-dvh antialiased font-sans", roboto.variable)}>
      <body className={cn("min-h-dvh bg-background font-sans text-foreground", roboto.className)}>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
