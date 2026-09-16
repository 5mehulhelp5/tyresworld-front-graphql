import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_INSTALLER_STORES_QUERY } from "@/lib/queries";

/* GET /api/store-locator?locale=en|ar
 *
 * Branches come from Magento's `kleverInstallerStores` GraphQL query (Klever
 * module) — real, active installer/pickup partners, not the standard MSI
 * `pickupLocations` API this route used before. That one returns ZERO
 * results (confirmed live — nothing is configured under Stores > Inventory
 * > Sources), so this page's branch list was always empty. kleverInstallerStores
 * returns real data matching what the live storefront's own store-locator
 * page shows (verified: same store name as the live page's first result).
 * `delivery_mode: "outlet"` is this query's own short vocabulary — distinct
 * from the "install_at_outlet" value used at checkout. `cities` is derived
 * from whichever branches actually come back — never a fixed list.
 *
 * Booking time slots have no Magento entity behind them at all — there's no
 * backend concept of installation appointment windows — so that part of the
 * response still comes from the local JSON config file. That's a business
 * scheduling policy, not data with a live source to begin with.
 *
 * (Previously this file also served `deliveryOptions` and `mobileVans` —
 * including a static "AED 150.00" mobile-van fee — from that same JSON file,
 * but the storelocator page never actually rendered either one; removed
 * rather than leave a stale price sitting in an API response nothing reads.)
 */

import { getStores, KleverStoreItem } from "@/lib/services/stores.service";

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  external_link?: string;
};

async function fetchBranches(locale: string): Promise<{ branches: Branch[]; cities: string[] }> {
  // 1. Try public store locator query (kleverStores) — carries phone, email, map links
  const storesData = await getStores({ store: locale, pageSize: 50 });
  if (storesData?.items?.length) {
    const branches: Branch[] = storesData.items
      .map((i): Branch | null => {
        const lat = i.latitude != null ? Number(i.latitude) : NaN;
        const lng = i.longitude != null ? Number(i.longitude) : NaN;
        const name = locale === "ar" && i.name_ar ? i.name_ar : i.name;
        if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const address = locale === "ar" && i.address_ar ? i.address_ar : i.address;
        const city = locale === "ar" && i.city_ar ? i.city_ar : (i.city ?? "");
        const phone = i.phone?.trim() || undefined;
        const whatsapp = phone ? phone.replace(/[^0-9]/g, "") : undefined;

        return {
          id: i.stores_id != null ? String(i.stores_id) : `${name}-${lat}-${lng}`,
          name,
          address: [address, city, i.country].filter(Boolean).join(", "),
          city: city,
          lat,
          lng,
          phone,
          whatsapp,
          email: i.email?.trim() || undefined,
          external_link: i.external_link?.trim() || undefined,
        };
      })
      .filter((b): b is Branch => b !== null);

    const cities = Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));
    return { branches, cities };
  }

  // 2. Fallback to installer stores query
  const r = await magentoFetch<{ kleverInstallerStores?: { stores_id?: number; name?: string; city?: string; address?: string; country?: string; latitude?: string | number; longitude?: string | number }[] | null }>(
    KLEVER_INSTALLER_STORES_QUERY,
    { deliveryMode: "outlet" },
    { store: locale, revalidate: 300 },
  );

  if (!r.ok || r.errors?.length) {
    throw new Error(r.errors?.[0]?.message ?? "kleverStores query failed");
  }

  const items = r.data?.kleverInstallerStores ?? [];

  const branches: Branch[] = items
    .map((i) => {
      const lat = i.latitude != null ? Number(i.latitude) : NaN;
      const lng = i.longitude != null ? Number(i.longitude) : NaN;
      if (!i.name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        id: i.stores_id != null ? String(i.stores_id) : `${i.name}-${lat}-${lng}`,
        name: i.name,
        address: [i.address, i.city, i.country].filter(Boolean).join(", "),
        city: i.city ?? "",
        lat,
        lng,
      };
    })
    .filter((b): b is Branch => b !== null);

  const cities = Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));

  return { branches, cities };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const allLabel = locale === "ar" ? "الكل" : "All";

  let timeSlots: unknown[] = [];
  try {
    const jsonPath = path.join(process.cwd(), "public", "data", "store-locator.json");
    const fileContent = await fs.readFile(jsonPath, "utf-8");
    const parsed = JSON.parse(fileContent);
    const localeConfig = parsed[locale] ?? parsed.en;
    timeSlots = localeConfig.timeSlots ?? [];
  } catch (err) {
    console.error("Failed to read store locator config JSON:", err);
  }

  try {
    const { branches, cities } = await fetchBranches(locale);

    return NextResponse.json(
      {
        cities: [allLabel, ...cities],
        branches,
        timeSlots,
      },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error("Failed to fetch pickup locations from Magento:", err);
    return NextResponse.json(
      {
        cities: [allLabel],
        branches: [],
        timeSlots,
        error: "Store locations unavailable",
      },
      { status: 200 },
    );
  }
}
