"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { ExcludedDeal } from "@/lib/types";

const PAGE_SIZE = 8;

type ExcludedDealsPanelProps = {
  excluded: ExcludedDeal[];
};

function ruleTone(rule: string): "default" | "secondary" | "destructive" | "outline" {
  const lower = rule.toLowerCase();
  if (lower.includes("budget") || lower.includes("cash needed")) return "destructive";
  if (lower.includes("bedroom")) return "secondary";
  if (lower.includes("pencil") || lower.includes("coc")) return "outline";
  return "secondary";
}

function shortRule(rule: string): string {
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

export function ExcludedDealsPanel({ excluded }: ExcludedDealsPanelProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(excluded.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = useMemo(
    () => excluded.slice(start, start + PAGE_SIZE),
    [excluded, start],
  );

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
              Deals that broke a hard rule for this client
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
              <TableHead className="w-[40%] pl-5">Deal</TableHead>
              <TableHead className="w-[20%]">Reason</TableHead>
              <TableHead className="pr-5">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((item) => {
              const place = [item.deal_city, item.deal_state].filter(Boolean).join(", ");
              const title = item.deal_address || item.deal_id;
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
                  <TableCell className="pr-5 align-middle text-sm text-muted-foreground">
                    {item.rule}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

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
