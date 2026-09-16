/* ─────────────────────────────────────────────────────────────────
   HOMEPAGE SERVICE
   Real dynamic homepage sections from Magento's Klever module (kleverHomepage):
   - Hero banner (headings + images)
   - Exclusive offers (banners + promo links)
   - How it works (steps + descriptions)
   - Services (auto care solution tiles)
   - Top reasons (why buy online tyres)
   - About us (intro paragraphs)
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_HOMEPAGE_QUERY } from "@/lib/queries";

export interface KleverHomeHero {
  heading_line1?: string | null;
  heading_line2?: string | null;
  image?: string | null;
  image_mobile?: string | null;
}

export interface KleverHomeBanner {
  title?: string | null;
  image?: string | null;
  url?: string | null;
}

export interface KleverHomeOffers {
  title?: string | null;
  subtitle?: string | null;
  banners?: KleverHomeBanner[] | null;
}

export interface KleverHomeStep {
  number?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface KleverHomeSteps {
  title?: string | null;
  steps?: KleverHomeStep[] | null;
}

export interface KleverHomeServiceTile {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
}

export interface KleverHomeServices {
  title?: string | null;
  subtitle?: string | null;
  tiles?: KleverHomeServiceTile[] | null;
}

export interface KleverHomeReasons {
  title?: string | null;
  items?: string[] | null;
}

export interface KleverHomeAbout {
  title?: string | null;
  paragraphs?: string[] | null;
}

export interface KleverHomepageData {
  hero?: KleverHomeHero | null;
  offers?: KleverHomeOffers | null;
  how_it_works?: KleverHomeSteps | null;
  services?: KleverHomeServices | null;
  top_reasons?: KleverHomeReasons | null;
  about?: KleverHomeAbout | null;
}

interface HomepageResponse {
  kleverHomepage?: KleverHomepageData | null;
}

export async function getHomepageData(store?: string): Promise<KleverHomepageData | null> {
  try {
    const res = await magentoFetch<HomepageResponse>(
      KLEVER_HOMEPAGE_QUERY,
      {},
      {
        store,
        revalidate: 300, // 5 minutes cache
      },
    );

    if (res.errors?.length) {
      console.warn("kleverHomepage GraphQL errors:", res.errors);
      return null;
    }

    return res.data?.kleverHomepage ?? null;
  } catch (err) {
    console.error("Failed to fetch kleverHomepage:", err);
    return null;
  }
}
