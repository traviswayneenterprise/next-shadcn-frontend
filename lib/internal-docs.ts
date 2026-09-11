import "server-only";

import { env } from "@/env.mjs";

export type DocEntry = { slug: string[]; title: string };

async function internalFetch(path: string) {
  if (!env.INTERNAL_API_URL || !env.INTERNAL_DOCS_TOKEN) return null;
  const response = await fetch(`${env.INTERNAL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${env.INTERNAL_DOCS_TOKEN}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

export async function listProjectDocs(): Promise<DocEntry[]> {
  const result = await internalFetch("/internal/docs");
  return result?.docs ?? [];
}

export async function readProjectDoc(slug: string[]): Promise<string | null> {
  const result = await internalFetch(`/internal/docs/${slug.join("/")}`);
  return result?.content ?? null;
}
