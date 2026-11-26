import { DealList } from "@/components/deals/DealList";
import { fetchDeals } from "@/lib/api";

type DealsMasterProps = {
  page?: number;
};

export async function DealsMaster({ page = 1 }: DealsMasterProps) {
  const result = await fetchDeals(page, 12);

  return <DealList deals={result.data} pagination={result.pagination} />;
}
