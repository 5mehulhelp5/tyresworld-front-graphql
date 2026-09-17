# TyresWorld — Set of 4 & Offer Pricing Logic Documentation

This document explains the exact conditions, data structures, and formulas used for calculating **Set of 4** and **Bulk/Promo Offer Pricing** across the TyresWorld frontend application.

---

## 1. Overview & Data Structure

When a product is fetched from Magento GraphQL (`kleverSetPricing` fragment), the API returns tiered set pricing and promotional rule information:

```typescript
export interface ProductSetPricing {
  set1?: number;                 // Price for 1 unit (e.g. 500 AED)
  set2?: number;                 // Price for 2 units (e.g. 1000 AED)
  set4?: number;                 // Price for 4 units (e.g. 1500 AED with Buy 3 Get 1 Free)
  promoLabel?: string;          // e.g. "Buy 3 Get 1 Free" or "25% OFF on Set of 4"
  promoBannerUrl?: string;      // Banner image URL if available
  promoDiscountAmount?: number; // Discount percentage (e.g. 25 for 25% discount)
  promoDiscountStep?: number;   // Minimum quantity required for discount (e.g. 4)
}
```

---

## 2. Backend / Data Adapter Logic (`lib/magento.ts`)

### File Reference:
[`lib/magento.ts`](file:///Users/klevertech/Desktop/Parth%20Ubuntu/tyresworld/tyresworld-front-graphql/lib/magento.ts#L215-L247)

### Problem Statement:
In Magento GraphQL, sometimes `set4_price` is returned as the un-discounted sum (`set1_price * 4`) even when an active promo rule exists (`promo_discount_step = 4` and `promo_discount_amount = 25`).

### Condition & Formula:
```typescript
function resolveSetPricing(p: GqlProduct): Product["setPricing"] {
  const sp = p.kleverSetPricing;
  if (!sp) return undefined;

  const set1 = parseSetPrice(sp.set1_price);
  const set2 = parseSetPrice(sp.set2_price);
  let set4 = parseSetPrice(sp.set4_price);
  const promoDiscountAmount = parseSetPrice(sp.promo_discount_amount);
  const promoDiscountStep = parseSetPrice(sp.promo_discount_step);
  const promoLabel = sp.promo_label ?? undefined;

  // ── Condition for Set of 4 Offer: ──
  if (
    set4 != null &&
    set1 != null &&
    promoDiscountStep === 4 &&
    promoDiscountAmount != null &&
    promoDiscountAmount > 0 &&
    promoDiscountAmount < 100 &&
    Math.abs(set4 - set1 * 4) < 2 // Detect if Magento returned raw 4x price without applying the discount
  ) {
    // Formula: Apply discount percentage
    set4 = Math.round(set4 * (1 - promoDiscountAmount / 100));
  }

  return {
    set1,
    set2,
    set4,
    promoLabel,
    promoBannerUrl: sp.promo_banner_url ?? undefined,
    promoDiscountAmount,
    promoDiscountStep,
  };
}
```

---

## 3. Product Detail Page (PDP) Logic (`components/ProductDetailInner.tsx`)

### File Reference:
[`components/ProductDetailInner.tsx`](file:///Users/klevertech/Desktop/Parth%20Ubuntu/tyresworld/tyresworld-front-graphql/components/ProductDetailInner.tsx#L320-L380)

### Condition & Formula:
On the Product Detail Page:
1. `setSize` is typically `4` for cars (or `2` for staggered/motorcycles).
2. If `product.setPricing.set4` is available, it uses the special set price.
3. Otherwise, it falls back to standard multiplication (`product.price * setSize`).

```typescript
// 1. Check if set4 exists in setPricing:
const realSetPrice = setSize === 2 
  ? product.setPricing?.set2 
  : product.setPricing?.set4;

// 2. Compute final displayed Set of 4 price:
const setOf4Price = hasPrice 
  ? (realSetPrice ?? product.price * setSize) 
  : 0;
```

---

## 4. Tyre Listing Card / Dynamic Quantity Selection (`components/TyreListingCard.tsx`)

### File Reference:
[`components/TyreListingCard.tsx`](file:///Users/klevertech/Desktop/Parth%20Ubuntu/tyresworld/tyresworld-front-graphql/components/TyreListingCard.tsx#L170-L194)

### Condition & Formula:
When the user selects different quantities (e.g. 1, 2, 4, 8) from the quantity dropdown:

1. **Standard Tiers (1, 2, 4):**
   ```typescript
   let realSetPrice =
     qty === 1 ? product.setPricing?.set1
     : qty === 2 ? product.setPricing?.set2
     : qty === 4 ? product.setPricing?.set4
     : undefined;
   ```

2. **Multiples of 4 (e.g. 8 tyres = 2 sets of 4):**
   If quantity is a multiple of 4 (`qty % 4 === 0`), extend the promotional discount:
   ```typescript
   const { promoDiscountAmount, promoDiscountStep } = product.setPricing ?? {};

   if (
     realSetPrice == null &&
     promoDiscountStep === 4 &&
     promoDiscountAmount != null &&
     promoDiscountAmount > 0 &&
     promoDiscountAmount < 100 &&
     qty > 0 &&
     qty % 4 === 0
   ) {
     realSetPrice = qty * unitPrice * (1 - promoDiscountAmount / 100);
   }

   // Final price passed to Add To Cart and display:
   const setPrice = realSetPrice ?? unitPrice * qty;
   ```

---

## 5. Staggered Fitment (Front + Rear) Logic (`components/StaggeredTyreCard.tsx`)

### File Reference:
[`components/StaggeredTyreCard.tsx`](file:///Users/klevertech/Desktop/Parth%20Ubuntu/tyresworld/tyresworld-front-graphql/components/StaggeredTyreCard.tsx#L225)

For vehicles requiring different tyre sizes on front and rear axles (2 front + 2 rear = 4 tyres total):

```typescript
const setOf4Price = bundlePrice ?? ((frontPrice * 2) + (rearPrice * 2));
```

---

## 6. Summary Flowchart

```
┌─────────────────────────────────────────────────────────┐
│                    Magento GraphQL                      │
│                  (kleverSetPricing)                     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              resolveSetPricing(p) (lib/magento.ts)      │
│  Check: Is promoDiscountStep === 4 && set4 un-discounted?│
│  YES ──> set4 = set4 * (1 - promoDiscountAmount / 100)   │
│  NO  ──> Keep original set4_price                       │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  Product Detail Page (PDP)   │  │   Listing Card / Cart (Qty)  │
│  setOf4Price =               │  │  qty=4 -> setPricing.set4    │
│  product.setPricing?.set4    │  │  qty=8 -> qty * price * 0.75 │
│  ?? (product.price * 4)      │  │  fallback -> qty * price     │
└──────────────────────────────┘  └──────────────────────────────┘
```
