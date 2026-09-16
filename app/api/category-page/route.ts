import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_PAGE_QUERY, CATEGORY_UID_BY_URL_KEY_QUERY } from "@/lib/queries";
import { parseGraphqlResponse, parseAggregations } from "@/lib/magento";
import { APP_CONFIG, magentoHeaders } from "@/src/config/app-config";
import { resolveBrandInfo } from "@/lib/services/brands.service";
import type { Product } from "@/lib/data";
type SortInput = Record<string, "ASC" | "DESC">;

/**
 * Staggered (front+rear) pagination has to be computed from the number of
 * pairs that will actually render, not Magento's front-only total_count —
 * a front tyre whose brand has no rear stock in that size never becomes a
 * card, so pairing must run over every candidate before paging. This caps
 * how many of each side are pulled to do that; comfortably above any real
 * single-size result count.
 */
const STAGGERED_FETCH_CAP = 200;

/**
 * This store's Magento GraphQL schema exposes no price-sortable field —
 * ProductAttributeSortInput only has mst_sort / position / relevance, no
 * `price` (confirmed via introspection). So "Price: Low to High/High to
 * Low" can't be delegated to Magento's `sort` argument at all; the old
 * code silently dropped it (buildSort() returned undefined for anything
 * but position/recommended) and the client only re-sorted whatever 12
 * items happened to be on the current Magento-paginated (position-order)
 * page — cosmetically ordered within that page, but page 1 wasn't
 * actually the cheapest items site-wide, and page 2 could easily contain
 * cheaper ones than page 1. Real fix: fetch a large batch in Magento's
 * default order, sort the *real* results ourselves, then paginate the
 * sorted set — same fetch-big-then-slice pattern the staggered branch
 * below already uses for its own (different) reason.
 */
const PRICE_SORT_FETCH_CAP = 1000;

/**
 * Pair each front tyre with an unused rear tyre of the same brand — same
 * pattern preferred, any pattern of that brand otherwise. Never crosses
 * brands. Mirrors the matching in StaggeredTyreCard's caller
 * (components/category/CategoryPageInner.tsx) — kept here too so the
 * pagination below reflects the count that will actually render.
 */
function pairStaggered(front: Product[], rear: Product[]): { front: Product; rear: Product }[] {
  const usedRearIds = new Set<string>();
  const pairs: { front: Product; rear: Product }[] = [];

  front.forEach((f) => {
    const frontBrand = String(f.brandName ?? f.brand ?? "").toLowerCase().trim();
    const frontPattern = String(f.pattern ?? "").toLowerCase().trim();

    let match = rear.find((r) => {
      if (usedRearIds.has(r.id)) return false;
      const rBrand = String(r.brandName ?? r.brand ?? "").toLowerCase().trim();
      const rPattern = String(r.pattern ?? "").toLowerCase().trim();
      return rBrand === frontBrand && !!rPattern && !!frontPattern && rPattern === frontPattern;
    });

    if (!match) {
      match = rear.find((r) => {
        if (usedRearIds.has(r.id)) return false;
        const rBrand = String(r.brandName ?? r.brand ?? "").toLowerCase().trim();
        return rBrand === frontBrand;
      });
    }

    if (match) {
      const matchBrand = String(match.brandName ?? match.brand ?? "").toLowerCase().trim();
      if (matchBrand === frontBrand) {
        usedRearIds.add(match.id);
        pairs.push({ front: f, rear: match });
      }
    }
  });

  return pairs;
}

function buildSort(order: string): SortInput | undefined {
  switch (order) {
    case "position":
      return { position: "ASC" };
    default:
      return undefined;
  }
}

function buildCategoryMetadata(
  cat: { uid: string; name: string; description?: string | null; meta_title?: string | null; meta_description?: string | null; url_key?: string; category_page_title?: string | null } | undefined | null,
) {
  /* electric-vehicle-tyres-uae / ev-tyres / ev-tires and run-flat-tires used
     to return fully fabricated name/metaTitle/metaDescription/description
     text here instead of using `cat` — invented marketing copy, not sourced
     from Magento. `cat` is the real Tyres category (uid MTg=) fetched by
     every caller of this function regardless of urlKey (all three of these
     synthetic filtered views resolve to that same real category), so it was
     available the whole time; the special branches just discarded it. */
  if (!cat) return null;
  return {
    uid: cat.uid,
    name: cat.name,
    description: cat.description ?? null,
    metaTitle: cat.meta_title ?? null,
    metaDescription: cat.meta_description ?? null,
    // The on-page H1 — a dedicated Magento field distinct from both `name`
    // (used in breadcrumbs/nav) and `meta_title` (used in <title>). e.g.
    // Car Battery: name="Car Battery", meta_title="Buy High-Performance
    // Car Batteries in UAE | TyresCart", category_page_title="Buy Car
    // Battery Online in UAE" — the live site's real H1 text.
    pageTitle: cat.category_page_title ?? null,
    urlKey: cat.url_key,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

  const urlKey      = searchParams.get("urlKey") ?? "";
  const store       = searchParams.get("store") ?? "default";
  const pageSize    = Math.min(Number(searchParams.get("pageSize") ?? 12) || 12, 48);
  const currentPage = Math.max(Number(searchParams.get("page") ?? 1) || 1, 1);
  const rawSort     = searchParams.get("sort") ?? "";
  const sort        = buildSort(rawSort);
  /* "recommended" is folded in here too — verified live (Puppeteer, same
     product order + same real prices for /en/tyres with no sort param vs
     ?product_list_order=recommended vs ?product_list_order=low-to-high):
     on this store, "Recommended" isn't a distinct Magento sort at all, it
     produces the exact same ascending-price order as the real default.
     Previously mapped to `{ position: "ASC" }`, a real but DIFFERENT
     Magento sort (admin-configured position order) that doesn't match
     what the live toolbar option actually produces. */
  const isPriceSort = rawSort === "low-to-high" || rawSort === "high-to-low" || rawSort === "recommended";
  const search      = searchParams.get("q") ?? searchParams.get("search") ?? "";

  if (!urlKey) {
    return NextResponse.json({ error: "urlKey is required" }, { status: 400 });
  }

  const isEvCategory =
    urlKey === "electric-vehicle-tyres-uae" ||
    urlKey === "ev-tyres" ||
    urlKey === "ev-tires";
  const isRunFlatCategory = urlKey === "run-flat-tires";
  const isTyreCategory =
    urlKey === "tyres" ||
    urlKey === "tyres/size" ||
    urlKey === "tyres/cars" ||
    urlKey === "brand" ||
    urlKey === "special-offers" ||
    isEvCategory ||
    isRunFlatCategory;

  /* Resolve category urlKey → category UID using known mappings, route query, and fallback */
  let categoryUid: string | null = null;
  if (urlKey === "motorcycle-tyre") {
    categoryUid = APP_CONFIG.magento.motorcycleCategoryUid;
  } else if (isTyreCategory) {
    categoryUid = APP_CONFIG.magento.tyresCategoryUid;
  } else {
    try {
      const lookup = await fetch(APP_CONFIG.magento.graphqlUrl, {
        method: "POST",
        headers: magentoHeaders(store),
        body: JSON.stringify({
          query: `query($url: String!) {
            route(url: $url) {
              type
              ... on CategoryInterface {
                uid
              }
            }
          }`,
          variables: { url: urlKey },
        }),
        next: { revalidate: APP_CONFIG.cache.category },
      });
      const lj = await lookup.json().catch(() => null);
      categoryUid = lj?.data?.route?.uid ?? null;

      if (!categoryUid) {
        const fallbackKey = urlKey.split("/").pop() ?? urlKey;
        const fRes = await fetch(APP_CONFIG.magento.graphqlUrl, {
          method: "POST",
          headers: magentoHeaders(store),
          body: JSON.stringify({
            query: CATEGORY_UID_BY_URL_KEY_QUERY,
            variables: { urlKey: fallbackKey },
          }),
          next: { revalidate: APP_CONFIG.cache.category },
        });
        const fj = await fRes.json().catch(() => null);
        categoryUid = fj?.data?.categories?.items?.[0]?.uid ?? null;
      }
    } catch {
      categoryUid = null;
    }
  }

  if (!categoryUid) {
    return NextResponse.json(
      { error: `Category "${urlKey}" not found` },
      { status: 404 },
    );
  }

  /* Build product filter using category_uid and all dynamic filterable attributes */
  const filters: Record<string, unknown> = {
    category_uid: { eq: categoryUid },
  };

  if (isEvCategory) {
    filters.ev_tyre = { eq: "EV" };
  } else if (isRunFlatCategory) {
    filters.runflat = { eq: "RunFlat" };
  }

  const RESERVED = new Set([
    "urlKey",
    "store",
    "pageSize",
    "page",
    "sort",
    "q",
    "search",
    "product_list_limit",
    "product_list_order",
    "category_uid",
    "width",
    "height",
    "haight",
    "rim",
    "width_rear",
    "rear_width",
    "rwidth",
    "haight_rear",
    "height_rear",
    "rear_height",
    "rheight",
    "rim_rear",
    "rear_rim",
    "rrim",
  ]);

  const frontWidth = searchParams.get("width");
  const frontHeight = searchParams.get("height") ?? searchParams.get("haight");
  const frontRim = searchParams.get("rim");

  if (frontWidth) filters.width = { eq: frontWidth };
  if (frontHeight) filters.height = { eq: frontHeight };
  if (frontRim) filters.rim = { eq: frontRim };

  for (const [key, value] of searchParams.entries()) {
    if (RESERVED.has(key)) continue;
    const values = value.split(",").filter(Boolean);
    if (values.length === 1) filters[key] = { eq: values[0] };
    else if (values.length > 1) filters[key] = { in: values };
  }

  const leafUrlKey = isTyreCategory
    ? "tyres"
    : (urlKey.split("/").pop() ?? urlKey);

  const rearWidth =
    searchParams.get("width_rear") ??
    searchParams.get("rear_width") ??
    searchParams.get("rwidth");
  const rearHeight =
    searchParams.get("haight_rear") ??
    searchParams.get("height_rear") ??
    searchParams.get("rear_height") ??
    searchParams.get("rheight");
  const rearRim =
    searchParams.get("rim_rear") ??
    searchParams.get("rear_rim") ??
    searchParams.get("rrim");
  const isStaggeredRequest = Boolean(rearWidth && rearHeight && rearRim);

  /* ── Staggered (front+rear) request ──────────────────────────
       Pull every candidate on both sides (capped), pair them, THEN
       paginate the pairs — not Magento's front-only total_count.
       A front tyre whose brand has no rear stock in that size never
       becomes a card, so paginating before pairing (the old approach)
       could promise pages the pairing step would leave mostly empty. */
    if (isStaggeredRequest) {
      const rearFilters: Record<string, unknown> = {
        category_uid: { eq: categoryUid },
        width: { eq: rearWidth },
        height: { eq: rearHeight },
        rim: { eq: rearRim },
      };
      for (const [key, value] of searchParams.entries()) {
        if (RESERVED.has(key)) continue;
        const values = value.split(",").filter(Boolean);
        if (values.length === 1) rearFilters[key] = { eq: values[0] };
        else if (values.length > 1) rearFilters[key] = { in: values };
      }

      const fullFrontVars: Record<string, unknown> = {
        urlKey: leafUrlKey,
        filters,
        pageSize: STAGGERED_FETCH_CAP,
        currentPage: 1,
      };
      if (sort) fullFrontVars.sort = sort;
      if (search) fullFrontVars.search = search;

      const fullRearVars: Record<string, unknown> = {
        urlKey: leafUrlKey,
        filters: rearFilters,
        pageSize: STAGGERED_FETCH_CAP,
        currentPage: 1,
      };
      if (sort) fullRearVars.sort = sort;

      const [frontRes, rearRes] = await Promise.all([
        fetch(APP_CONFIG.magento.graphqlUrl, {
          method: "POST",
          headers: magentoHeaders(store),
          body: JSON.stringify({ query: CATEGORY_PAGE_QUERY, variables: fullFrontVars }),
          next: { revalidate: 300 },
        }),
        fetch(APP_CONFIG.magento.graphqlUrl, {
          method: "POST",
          headers: magentoHeaders(store),
          body: JSON.stringify({ query: CATEGORY_PAGE_QUERY, variables: fullRearVars }),
          next: { revalidate: 300 },
        }),
      ]);

      const frontJson = await frontRes.json().catch(() => null);
      const rearJson = await rearRes.json().catch(() => null);

      if (!frontRes.ok && !frontJson?.data) {
        return NextResponse.json(
          { error: frontJson?.errors?.[0]?.message ?? `HTTP ${frontRes.status}` },
          { status: frontRes.status }
        );
      }
      if (frontJson && frontJson.data === null) {
        const msg = (frontJson.errors as { message: string }[] | undefined)?.[0]?.message ?? "Magento query failed";
        console.error("[category-page] Magento returned null data:", msg);
        return NextResponse.json({ error: msg }, { status: 200 });
      }
      if (frontJson?.errors?.length) {
        console.warn("[category-page] GraphQL warnings (front):", (frontJson.errors as { message: string }[]).map(e => e.message));
      }
      if (rearJson?.errors?.length) {
        console.warn("[category-page] GraphQL warnings (rear):", (rearJson.errors as { message: string }[]).map(e => e.message));
      }

      const cat = frontJson?.data?.categories?.items?.[0];
      const frontPd = frontJson?.data?.products;
      const rearPd = rearJson?.data?.products;

      const allFront = await resolveBrandInfo(parseGraphqlResponse({ data: { products: frontPd } }), store);
      const allRear = rearPd ? await resolveBrandInfo(parseGraphqlResponse({ data: { products: rearPd } }), store) : [];

      /* Unpaired fallback listing — same semantics as the plain path below:
         total/totalPages reflect Magento's real front-only total_count, and
         `products` is this page's slice, sliced here in JS since this fetch
         pulled up to STAGGERED_FETCH_CAP in one shot rather than asking
         Magento to page a front-only query. Used when no pairs exist at all,
         so the user still sees the front-size results instead of nothing. */
      const frontTotal = frontPd?.total_count ?? allFront.length;
      const frontTotalPages = Math.max(1, Math.ceil(frontTotal / pageSize));
      const pageStart = (currentPage - 1) * pageSize;
      const productsPage = allFront.slice(pageStart, pageStart + pageSize);

      /* Paired listing — this is the fix: pagination is derived from the
         actual pair count, so the page control never promises more than
         will render. */
      const pairs = pairStaggered(allFront, allRear);
      const pairedTotal = pairs.length;
      const pairedTotalPages = Math.max(1, Math.ceil(pairedTotal / pageSize));
      const pairedSlice = pairs.slice(pageStart, pageStart + pageSize);

      return NextResponse.json(
        {
          category: buildCategoryMetadata(cat),
          products:    productsPage,
          rearProducts: allRear,
          filters:     parseAggregations({ data: { products: frontPd } }, frontTotal),
          total:       frontTotal,
          totalPages:  frontTotalPages,
          currentPage,
          staggered: {
            total:       pairedTotal,
            totalPages:  pairedTotalPages,
            products:    pairedSlice.map((p) => p.front),
            rearProducts: pairedSlice.map((p) => p.rear),
          },
        },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
      );
    }

    /* ── Plain request, price sort ────────────────────────────────
       Magento can't sort by price for this store (see PRICE_SORT_FETCH_CAP
       above) — fetch a large batch in default order, sort the real result
       set ourselves, then slice out the requested page. */
    if (isPriceSort) {
      const allVars: Record<string, unknown> = {
        urlKey: leafUrlKey,
        filters,
        pageSize: PRICE_SORT_FETCH_CAP,
        currentPage: 1,
      };
      if (search) allVars.search = search;

      const allRes = await fetch(APP_CONFIG.magento.graphqlUrl, {
        method: "POST",
        headers: magentoHeaders(store),
        body: JSON.stringify({ query: CATEGORY_PAGE_QUERY, variables: allVars }),
        next: { revalidate: 300 },
      });
      const allJson = await allRes.json().catch(() => null);

      if (!allRes.ok && !allJson?.data) {
        return NextResponse.json(
          { error: allJson?.errors?.[0]?.message ?? `HTTP ${allRes.status}` },
          { status: allRes.status },
        );
      }
      if (allJson && allJson.data === null) {
        const msg = (allJson.errors as { message: string }[] | undefined)?.[0]?.message ?? "Magento query failed";
        console.error("[category-page] Magento returned null data:", msg);
        return NextResponse.json({ error: msg }, { status: 200 });
      }
      if (allJson?.errors?.length) {
        console.warn("[category-page] GraphQL warnings:", (allJson.errors as { message: string }[]).map((e) => e.message));
      }

      const cat = allJson?.data?.categories?.items?.[0];
      const pd = allJson?.data?.products;
      const allProducts = await resolveBrandInfo(parseGraphqlResponse({ data: { products: pd } }), store);

      allProducts.sort((a, b) =>
        rawSort === "high-to-low" ? (b.price ?? 0) - (a.price ?? 0) : (a.price ?? 0) - (b.price ?? 0),
      );

      // Never promise more pages than what was actually fetched and sorted.
      const total = Math.min(pd?.total_count ?? allProducts.length, PRICE_SORT_FETCH_CAP);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const pageStart = (currentPage - 1) * pageSize;

      return NextResponse.json(
        {
          category: buildCategoryMetadata(cat),
          products: allProducts.slice(pageStart, pageStart + pageSize),
          rearProducts: [],
          filters: parseAggregations({ data: { products: pd } }, pd?.total_count ?? allProducts.length),
          total,
          totalPages,
          currentPage,
        },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } },
      );
    }

    /* ── Plain (single-size) request — unchanged ─────────────────── */
    const variables: Record<string, unknown> = { urlKey: leafUrlKey, filters, pageSize, currentPage };
    if (sort) variables.sort = sort;
    if (search) variables.search = search;

    const res = await fetch(APP_CONFIG.magento.graphqlUrl, {
      method: "POST",
      headers: magentoHeaders(store),
      body: JSON.stringify({ query: CATEGORY_PAGE_QUERY, variables }),
      next: { revalidate: 300 },
    });

    const json = await res.json().catch(() => null);

    // Hard failure: HTTP error with no data body
    if (!res.ok && !json?.data) {
      return NextResponse.json(
        { error: json?.errors?.[0]?.message ?? `HTTP ${res.status}` },
        { status: res.status }
      );
    }
    // Magento returned data:null — query-level failure (e.g. invalid variable)
    if (json && json.data === null) {
      const msg = (json.errors as { message: string }[] | undefined)?.[0]?.message ?? "Magento query failed";
      console.error("[category-page] Magento returned null data:", msg);
      return NextResponse.json({ error: msg }, { status: 200 });
    }
    if (json?.errors?.length) {
      console.warn("[category-page] GraphQL warnings:", (json.errors as { message: string }[]).map(e => e.message));
    }

    const cat = json?.data?.categories?.items?.[0];
    const pd  = json?.data?.products;

    return NextResponse.json(
      {
        category: buildCategoryMetadata(cat),
        products:    await resolveBrandInfo(parseGraphqlResponse({ data: { products: pd } }), store),
        rearProducts: [],
        /* Layered-nav options for the sidebar come back on this same
           response, so the listing needs no second request. */
        filters:     parseAggregations({ data: { products: pd } }, pd?.total_count ?? 0),
        total:       pd?.total_count ?? 0,
        totalPages:  pd?.page_info?.total_pages ?? 1,
        currentPage: pd?.page_info?.current_page ?? currentPage,
      },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 502 }
    );
  }
}
