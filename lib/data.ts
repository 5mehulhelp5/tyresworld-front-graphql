export type Product = {
  id: string;
  sku?: string;
  urlKey?: string;
  urlPath?: string;
  typeId?: string;
  name: string;
  displayName?: string;
  itemCode?: string;

  // Pricing
  price: number;
  originalPrice?: number;
  maxPrice?: number;
  currency?: string;

  // Images
  image: string;
  smallImage?: string;
  thumbnail?: string;

  // Descriptions
  descriptionHtml?: string;
  shortDescriptionHtml?: string;

  // Tyre-specific attributes
  brand?: string;
  brandName?: string;    // display name from backend
  brandLogoUrl?: string; // logo image URL from backend
  brandPageUrl?: string; // brand landing page URL from backend
  manufacturer?: string;
  size?: string;
  tyreSize?: string;
  pattern?: string;
  width?: string;
  height?: string;
  rim?: string;
  year?: string;
  origin?: string;
  country?: string;
  warrantyPeriod?: string;

  // Categorisation
  category: string;
  categories?: { id?: number | null; name: string; urlKey?: string }[];

  // Offers — raw Magento option ID; resolve to label via useOfferLabels()
  offersId?: string;

  /** Real per-set prices from Magento's own pricing/promo rules (Klever
      module) — use these for a "Set of N" display instead of unitPrice × qty
      wherever N is 1, 2, or 4; they're only undefined when the query didn't
      request/return this field or the backend gave no set pricing for a SKU. */
  setPricing?: {
    set1?: number;
    set2?: number;
    set4?: number;
    promoLabel?: string;
    promoBannerUrl?: string;
    promoDiscountAmount?: number;
    promoDiscountStep?: number;
  };

  /** Real per-SKU quantity constraints from Magento (Klever module) — the
      only source for quantity selector options/limits; undefined only when
      the query didn't request/return this field. */
  qtyOptions?: {
    salableQty?: number;
    maxQty?: number;
    defaultQty?: number;
    options?: number[];
    canAddToCart?: boolean;
    partsCategory?: string;
  };

  // Meta
  badge?: "New" | "Sale" | "Bestseller";
  rating: number;
  reviewCount: number;
  inStock?: boolean;
  quantity?: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  href: string;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  heading: string;
  sub: string;
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
  image: string;
  badge: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};


