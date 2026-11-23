import { DealList } from "@/components/deals/DealList";
import { fetchDeals } from "@/lib/api";

type DealsMasterProps = {
  page: number;
};

export async function DealsMaster({ page }: DealsMasterProps) {
  const result = await fetchDeals(page, 12);
  const pagination = result.pagination ?? {
    page,
    limit: 12,
    total: result.data.length,
    total_pages: 1,
  };

  return <DealList deals={result.data} pagination={pagination} />;
}
