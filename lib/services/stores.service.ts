/* ─────────────────────────────────────────────────────────────────
   STORES SERVICE
   Public Store Locator query (`kleverStores`) from Magento's Klever module.
   Returns all 26 active stores with rich data: phone numbers, coordinates,
   addresses, city, opening hours, Google Maps links, and media URLs.
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_STORES_QUERY } from "@/lib/queries";

export interface KleverStoreItem {
  stores_id?: number | null;
  name?: string | null;
  name_ar?: string | null;
  url_key?: string | null;
  address?: string | null;
  address_ar?: string | null;
  city?: string | null;
  city_ar?: string | null;
  region?: string | null;
  country?: string | null;
  postcode?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  image?: string | null;
  details_image?: string | null;
  intro?: string | null;
  description?: string | null;
  station?: string | null;
  external_link?: string | null;
  category?: string | null;
  opening_hours?: string | null;
  special_opening_hours?: string | null;
  delivery_mode?: string | null;
  installer_type?: string | null;
  is_mobilevan?: number | null;
  shipping_amount?: string | null;
}

interface KleverStoresResponse {
  kleverStores?: {
    total_count: number;
    items: KleverStoreItem[];
  } | null;
}

export async function getStores(params?: {
  city?: string;
  urlKey?: string;
  pageSize?: number;
  currentPage?: number;
  store?: string;
}): Promise<{ total_count: number; items: KleverStoreItem[] } | null> {
  const r = await magentoFetch<KleverStoresResponse>(
    KLEVER_STORES_QUERY,
    {
      city: params?.city,
      urlKey: params?.urlKey,
      pageSize: params?.pageSize ?? 50,
      currentPage: params?.currentPage ?? 1,
    },
    { store: params?.store, revalidate: 300 },
  );

  if (!r.ok || r.errors?.length) return null;
  return r.data?.kleverStores ?? null;
}
