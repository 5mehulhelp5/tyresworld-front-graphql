import { NextResponse } from "next/server";
import { getBrands } from "@/lib/services/brands.service";

/**
 * Real brand directory for the "Shop by Brands" strip (components/BrandStrip.tsx)
 * and the full brands index (components/brands/BrandsPageInner.tsx).
 *
 * Sourced from Magento's own Klever module (kleverBrands) — real names,
 * categories (Tyres / Battery / Wheels / Motorcycle Tyres / Wheel Alignment),
 * admin-configured feature flag + sort order, and real Magento-hosted logo
 * URLs. Replaces the previous approach: deriving names from a product
 * aggregation (misses any brand with no in-stock/indexed product) and
 * matching logos against a local file mirror by filename heuristics.
 *
 * `filterValue` is the brand's real display name — confirmed the working
 * value for a product-listing filter link (`?mgs_brand=<name>`); the
 * numeric `option_id` this endpoint also carries does NOT work as an eq
 * filter against products() (Elasticsuite indexes this attribute by label
 * text, not the raw option ID).
 */

export type BrandListItem = {
  name: string;
  filterValue: string;
  logo: string;
  category: string;
  isFeatured: boolean;
  sortOrder: number;
  urlKey?: string;
};

export async function GET() {
  const brands = await getBrands();

  if (!brands) {
    return NextResponse.json(
      { brands: [], error: "kleverBrands unavailable" },
      { status: 200 },
    );
  }

  const items: BrandListItem[] = brands
    .map((b): BrandListItem | null => {
      const name = b.name?.trim();
      const logo = b.image ?? b.small_image;
      if (!name || !logo) return null;
      return {
        name,
        filterValue: name,
        logo,
        category: b.brand_category?.trim() || "Other",
        isFeatured: b.is_featured === 1,
        sortOrder: b.sort_order ?? 0,
        urlKey: b.url_key ?? undefined,
      };
    })
    .filter((b): b is BrandListItem => b !== null);

  return NextResponse.json(
    { brands: items },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } },
  );
}
