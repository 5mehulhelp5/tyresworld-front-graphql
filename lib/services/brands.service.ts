/* ─────────────────────────────────────────────────────────────────
   BRANDS SERVICE
   Real brand directory (name, logo, category, admin-configured feature
   flag/sort order) from Magento's Klever module — replaces the old
   approach of deriving brand names from a product aggregation (misses
   brands with no in-stock products) and matching logos against a local
   file mirror by filename heuristics.
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_BRANDS_QUERY } from "@/lib/queries";

export interface KleverBrandItem {
  brand_id?: number | null;
  name?: string | null;
  url_key?: string | null;
  description?: string | null;
  image?: string | null;
  small_image?: string | null;
  brand_category?: string | null;
  is_featured?: number | null;
  sort_order?: number | null;
  option_id?: number | null;
}

interface KleverBrandsResponse {
  kleverBrands?: KleverBrandItem[] | null;
}

/** Real brands, or null on any failure (missing/invalid API key, network
    error) so callers can fall back gracefully rather than show nothing. */
export async function getBrands(params?: {
  brandCategory?: string;
  urlKey?: string;
  featuredOnly?: boolean;
  store?: string;
}): Promise<KleverBrandItem[] | null> {
  const r = await magentoFetch<KleverBrandsResponse>(
    KLEVER_BRANDS_QUERY,
    {
      brandCategory: params?.brandCategory,
      urlKey: params?.urlKey,
      featuredOnly: params?.featuredOnly,
    },
    { store: params?.store, revalidate: 1800 },
  );
  if (!r.ok || r.errors?.length) return null;
  return r.data?.kleverBrands ?? null;
}

/** option_id → real {name, image}, straight from Magento's own brand
    directory — the live replacement for the old static id→name/id→logo
    maps in lib/brandLogos.ts and the local public/brands file scan in
    lib/brandLogoScan.ts. magentoFetch already caches this for 30 minutes,
    so calling it once per request here is cheap. */
export async function getBrandLookup(
  store?: string,
): Promise<Map<number, { name: string; image: string | null }>> {
  const brands = await getBrands({ store });
  const map = new Map<number, { name: string; image: string | null }>();
  for (const b of brands ?? []) {
    if (b.option_id != null && b.name) {
      map.set(b.option_id, { name: b.name, image: b.image ?? null });
    }
  }
  return map;
}

/** Same real-data enrichment as resolveBrandInfo(), but for RAW (pre-
    adaptGqlProduct) GraphQL product nodes — sets brand_name/brand_logo_url
    in place so a later adaptGqlProduct() call (e.g. client-side in
    lib/wishlist-context.tsx, which can't hold the Klever API credentials
    resolveBrandInfo's fetch needs) picks them up through its existing
    `p.brand_name ?? …` / `p.brand_logo_url` preference, with no client-side
    changes needed. Mutates the given objects in place. */
export async function injectRawBrandFields<
  T extends { brand?: string | number | null; brand_name?: string | null; brand_logo_url?: string | null },
>(products: T[], store?: string): Promise<void> {
  if (!products.length) return;
  const lookup = await getBrandLookup(store);
  if (!lookup.size) return;
  for (const p of products) {
    const id = Number(p.brand);
    const real = Number.isFinite(id) ? lookup.get(id) : undefined;
    if (!real) continue;
    p.brand_name = real.name;
    if (!p.brand_logo_url && real.image) p.brand_logo_url = real.image;
  }
}

/** Enrich already-adapted products with the real brand name/logo from
    Magento's brand directory, matched by the numeric mgs_brand option id
    (`product.brand`) — the one real field Magento's product schema does
    expose. Products whose brand isn't in the directory are left exactly as
    they were; nothing invented or substituted for a miss. */
export async function resolveBrandInfo<
  T extends { brand?: string | null; brandName?: string; brandLogoUrl?: string },
>(products: T[], store?: string): Promise<T[]> {
  if (!products.length) return products;
  const lookup = await getBrandLookup(store);
  if (!lookup.size) return products;

  return products.map((p) => {
    const id = Number(p.brand);
    const real = Number.isFinite(id) ? lookup.get(id) : undefined;
    if (!real) return p;
    return {
      ...p,
      brandName: real.name,
      brandLogoUrl: p.brandLogoUrl || real.image || undefined,
    };
  });
}
