/* ─────────────────────────────────────────────────────────────────
   REUSABLE GRAPHQL FRAGMENTS
   Named fragments on ProductInterface so product field selections are
   defined ONCE and spread into every query, instead of being copy-pasted.
   Append the fragment string to any query document that spreads it.
───────────────────────────────────────────────────────────────── */

/** Real per-set prices (set1/2/4 — a full pack, not unit price × qty) and
    any active bundle promo, from the Klever custom module. Requires the
    x-klever-api-key header (see magentoHeaders) — same auth gate as
    kleverMainMenu. Spliced into every product query that feeds a "Set of N"
    price display, so that number reflects Magento's own pricing/promo
    rules instead of a naive unitPrice × qty multiplication. */
export const KLEVER_SET_PRICING_FIELDS = `
  kleverSetPricing {
    set1_price
    set2_price
    set4_price
    promo_rule_id
    promo_label
    promo_banner_url
    promo_discount_amount
    promo_discount_step
  }
`;

/** Real per-SKU quantity constraints from the Klever module — salable_qty/
    max_qty/default_qty/options drive every quantity selector (cart, listing
    cards, PDP) instead of a fixed local list. Same auth gate as
    kleverSetPricing. */
export const KLEVER_QTY_OPTIONS_FIELDS = `
  kleverQtyOptions {
    salable_qty
    max_qty
    default_qty
    options
    can_add_to_cart
    parts_category
  }
`;

/** Minimal fields for product cards / listings (grids, carousels, search). */
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on ProductInterface {
    uid
    sku
    name
    stock_status
    url_key
    url_suffix
    brand: mgs_brand
    offers
    image { url label }
    price_range {
      minimum_price {
        final_price { value currency }
      }
    }
    country
    origin
    warranty_period
    ${KLEVER_SET_PRICING_FIELDS}
    ${KLEVER_QTY_OPTIONS_FIELDS}
  }
`;

/** Full fields for the product detail page (PDP). */
export const PRODUCT_DETAIL_FRAGMENT = /* GraphQL */ `
  fragment ProductDetailFields on ProductInterface {
    uid
    sku
    name
    url_key
    url_suffix
    stock_status
    review_count
    rating_summary
    reviews(pageSize: 10, currentPage: 1) {
      items {
        nickname
        summary
        text
        average_rating
        created_at
      }
      page_info {
        current_page
        page_size
        total_pages
      }
    }
    country_of_manufacture
    brand: mgs_brand
    offers
    country
    origin
    warranty_period
    bike_tyre_type
    description       { html }
    short_description { html }
    image         { url label }
    media_gallery { url label }
    categories { id name url_key }
    price_range {
      minimum_price {
        regular_price { value currency }
        final_price   { value currency }
        discount      { amount_off percent_off }
      }
    }
    ${KLEVER_SET_PRICING_FIELDS}
    ${KLEVER_QTY_OPTIONS_FIELDS}
  }
`;
