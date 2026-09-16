/* ─────────────────────────────────────────────────────────────────
   FAQ SERVICE
   Real FAQ groups/questions from Magento's Klever module (kleverFaq).
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_FAQ_QUERY } from "@/lib/queries";

export interface KleverFaqItem {
  faq_id?: number | null;
  question?: string | null;
  answer?: string | null;
  sort_order?: number | null;
}

export interface KleverFaqGroup {
  group_id?: number | null;
  name?: string | null;
  icon?: string | null;
  sort_order?: number | null;
  faqs?: KleverFaqItem[] | null;
}

interface FaqResponse {
  kleverFaq?: KleverFaqGroup[] | null;
}

export async function getFaqData(store?: string): Promise<KleverFaqGroup[]> {
  try {
    const res = await magentoFetch<FaqResponse>(
      KLEVER_FAQ_QUERY,
      { groupId: null },
      {
        store,
        revalidate: 3600,
      },
    );

    if (res.errors?.length) {
      console.warn("kleverFaq GraphQL errors:", res.errors);
      return [];
    }

    return res.data?.kleverFaq ?? [];
  } catch (err) {
    console.error("Failed to fetch kleverFaq:", err);
    return [];
  }
}
