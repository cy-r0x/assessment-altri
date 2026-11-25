import { ClientList } from "@/components/clients/ClientList";
import { fetchClients } from "@/lib/api";

type ClientsMasterProps = {
  page?: number;
};

export async function ClientsMaster({ page = 1 }: ClientsMasterProps) {
  const result = await fetchClients(page, 12);
  const pagination = result.pagination ?? {
    page,
    limit: 12,
    total: result.data.length,
    total_pages: 1,
  };

  return <ClientList clients={result.data} pagination={pagination} />;
}
