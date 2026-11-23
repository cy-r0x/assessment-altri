import type { ApiSuccess, ClientDetail, ClientSummary, DealSummary } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function fetchClients(page = 1, limit = 10): Promise<ApiSuccess<ClientSummary[]>> {
  const url = new URL("/api/v1/clients", API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load clients (${res.status})`);
  }

  return res.json();
}

export async function fetchClient(clientId: string): Promise<ApiSuccess<ClientDetail>> {
  const url = new URL(`/api/v1/clients/${clientId}`, API_URL);
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load client (${res.status})`);
  }

  return res.json();
}

export async function fetchDeals(page = 1, limit = 12): Promise<ApiSuccess<DealSummary[]>> {
  const url = new URL("/api/v1/deals", API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load deals (${res.status})`);
  }

  return res.json();
}

export function formatBudget(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFocus(focus: string | null | undefined): string {
  if (!focus) return "—";
  return focus
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

/** Soft cover tones — Airbnb-like photo block without a flat initials badge. */
export function clientCoverStyle(clientId: string): { backgroundImage: string } {
  const n = [...clientId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palettes = [
    ["#1e3a5f", "#7eb6d9", "#f2efe9"],
    ["#2f4a3c", "#8fbc8f", "#efe8df"],
    ["#5c3d2e", "#d4a574", "#f5efe8"],
    ["#3d4f5f", "#a8c0d0", "#f0eeea"],
    ["#4a3728", "#c4a484", "#f3ebe3"],
    ["#243b55", "#6b9ac4", "#eef2f5"],
  ];
  const [a, b, c] = palettes[n % palettes.length];
  const angle = 120 + (n % 40);
  return {
    backgroundImage: `linear-gradient(${angle}deg, ${a} 0%, ${b} 48%, ${c} 100%)`,
  };
}
