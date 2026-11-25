"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterX, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { postFeedback } from "@/lib/api";
import type { ExcludedDeal } from "@/lib/types";

const PAGE_SIZE = 8;

type ExcludedDealsPanelProps = {
  clientId: string;
  excluded: ExcludedDeal[];
  onChanged?: () => void;
};

function isClientDisliked(rule: string): boolean {
  return rule.toLowerCase().includes("disliked");
}

function ruleTone(rule: string): "default" | "secondary" | "destructive" | "outline" {
  const lower = rule.toLowerCase();
  if (isClientDisliked(rule)) return "destructive";
  if (lower.includes("budget") || lower.includes("cash needed")) return "destructive";
  if (lower.includes("bedroom")) return "secondary";
  if (lower.includes("pencil") || lower.includes("coc")) return "outline";
  return "secondary";
}

function shortRule(rule: string): string {
  if (isClientDisliked(rule)) return "Disliked";
  if (rule.toLowerCase().includes("budget")) return "Budget";
  if (rule.toLowerCase().includes("bedroom")) return "Bedrooms";
  if (rule.toLowerCase().includes("pencil") || rule.toLowerCase().includes("coc")) {
    return "Doesn’t pencil";
  }
  if (rule.toLowerCase().includes("avoid") || rule.toLowerCase().includes("market")) {
    return "Market";
  }
  return "Filtered";
}

export function ExcludedDealsPanel({
  clientId,
  excluded,
  onChanged,
}: ExcludedDealsPanelProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pendingDealId, setPendingDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(excluded.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = useMemo(
    () => excluded.slice(start, start + PAGE_SIZE),
    [excluded, start],
  );

  function undoDislike(dealId: string) {
    if (pending) return;
    setError(null);
    setPendingDealId(dealId);
    startTransition(async () => {
      try {
        // Same reaction again (no comment field) → API undoes the feedback row.
        await postFeedback({
          client_id: clientId,
          deal_id: dealId,
          reaction: "down",
        });
        onChanged?.();
        router.refresh();
      } catch {
        setError("Couldn’t undo dislike");
      } finally {
        setPendingDealId(null);
      }
    });
  }

  if (excluded.length === 0) return null;

  return (
    <Card className="mt-10 gap-0 overflow-hidden border-border/80 py-0 shadow-[var(--shadow-card)]">
      <CardHeader className="flex-row items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <FilterX size={16} strokeWidth={2} />
          </span>
          <div>
            <CardTitle className="text-base">Filtered out</CardTitle>
            <p className="text-xs text-muted-foreground">
              Hard-rule fails and deals this client disliked
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {excluded.length}
        </Badge>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[36%] pl-5">Deal</TableHead>
              <TableHead className="w-[18%]">Reason</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="w-[1%] pr-5 text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((item) => {
              const place = [item.deal_city, item.deal_state].filter(Boolean).join(", ");
              const title = item.deal_address || item.deal_id;
              const disliked = isClientDisliked(item.rule);
              const undoing = pendingDealId === item.deal_id;
              return (
                <TableRow key={item.deal_id} className="transition-colors duration-150">
                  <TableCell className="pl-5 align-middle">
                    <Link
                      href={`/deals/${item.deal_id}`}
                      className="block min-w-0 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <p className="truncate text-sm font-medium text-foreground hover:underline">
                        {title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {place || item.deal_id}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge variant={ruleTone(item.rule)} className="font-normal">
                      {shortRule(item.rule)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle text-sm text-muted-foreground">
                    {item.rule}
                  </TableCell>
                  <TableCell className="pr-5 align-middle text-right">
                    {disliked ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => undoDislike(item.deal_id)}
                        className="cursor-pointer gap-1.5 text-foreground-muted hover:text-foreground"
                      >
                        <RotateCcw
                          size={14}
                          className={undoing ? "animate-spin" : undefined}
                          aria-hidden
                        />
                        Undo
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {error ? (
          <p className="px-5 py-2 text-[13px] text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          compact
          label="Filtered deals pagination"
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
