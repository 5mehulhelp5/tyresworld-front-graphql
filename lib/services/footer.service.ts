/* ─────────────────────────────────────────────────────────────────
   FOOTER SERVICE
   Real dynamic footer data from Magento's Klever module (kleverFooter):
   - Contact info (official RAK address, email, WhatsApp, license, Google Maps)
   - Column categories and navigation links
   - Social media links (Facebook, Instagram)
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_FOOTER_QUERY } from "@/lib/queries";

export interface KleverFooterContact {
  address?: string | null;
  email?: string | null;
  license?: string | null;
  map_url?: string | null;
  phone?: string | null;
  phone_label?: string | null;
  whatsapp?: string | null;
  whatsapp_label?: string | null;
}

export interface KleverFooterLink {
  label?: string | null;
  url?: string | null;
}

export interface KleverFooterColumn {
  title?: string | null;
  links?: KleverFooterLink[] | null;
}

export interface KleverFooterSocial {
  platform?: string | null;
  url?: string | null;
}

export interface KleverFooterData {
  contact?: KleverFooterContact | null;
  columns?: KleverFooterColumn[] | null;
  social?: KleverFooterSocial[] | null;
}

interface FooterResponse {
  kleverFooter?: KleverFooterData | null;
}

export async function getFooterData(store?: string): Promise<KleverFooterData | null> {
  try {
    const res = await magentoFetch<FooterResponse>(
      KLEVER_FOOTER_QUERY,
      {},
      {
        store,
        revalidate: 3600, // 1 hour cache
      },
    );

    if (res.errors?.length) {
      console.warn("kleverFooter GraphQL errors:", res.errors);
      return null;
    }

    return res.data?.kleverFooter ?? null;
  } catch (err) {
    console.error("Failed to fetch kleverFooter:", err);
    return null;
  }
}
