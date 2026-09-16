/* ─────────────────────────────────────────────────────────────────
   MAIN MENU SERVICE
   Fetches the real main navigation from Magento's kleverMainMenu query
   instead of the curated src/config/navigation.ts fallback — so header
   changes made in Magento admin (new items, renamed labels, reordered
   entries) show up here automatically, no frontend deploy needed.
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_MAIN_MENU_QUERY } from "@/lib/queries";
import type { NavItem } from "@/src/config/navigation";

interface KleverMenuNode {
  label?: string | null;
  url?: string | null;
  children?: KleverMenuNode[] | null;
}

interface KleverMainMenuResponse {
  kleverMainMenu?: KleverMenuNode[] | null;
}

/** Bare slug ("tyres", "tyres/size"), no leading slash, no locale prefix —
    matches NavItem.slug's contract in src/config/navigation.ts. */
function toSlug(url: string): string {
  return url.replace(/^\/+/, "").replace(/\/+$/, "");
}

/** Stable React/dropdown key from the url, since Magento doesn't send one. */
function toId(url: string): string {
  return toSlug(url).toLowerCase().replace(/\//g, "-") || "home";
}

function adaptNode(node: KleverMenuNode): NavItem | null {
  if (!node.label || !node.url) return null;
  const item: NavItem = {
    id: toId(node.url),
    label: node.label,
    slug: toSlug(node.url),
  };
  const children = (node.children ?? [])
    .map(adaptNode)
    .filter((c): c is NavItem => c !== null);
  if (children.length) item.children = children;
  return item;
}

/**
 * Real live main menu, or null on any failure (missing/invalid API key,
 * network error, empty response) so the caller falls back to the curated
 * static MAIN_NAV rather than rendering an empty header.
 */
export async function getMainMenu(store?: string): Promise<NavItem[] | null> {
  const r = await magentoFetch<KleverMainMenuResponse>(
    KLEVER_MAIN_MENU_QUERY,
    undefined,
    { store, revalidate: 3600 },
  );
  if (!r.ok || r.errors?.length) return null;

  const items = (r.data?.kleverMainMenu ?? [])
    .map(adaptNode)
    .filter((i): i is NavItem => i !== null);

  return items.length ? items : null;
}
