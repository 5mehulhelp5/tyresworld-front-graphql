import { NextRequest, NextResponse } from "next/server";
import { getProductReviewsPage } from "@/lib/services/product.service";

/* GET /api/product/reviews?sku=X&page=N&pageSize=10
 * Additional pages of a product's real Magento reviews, beyond the first
 * page already returned inline by /api/product. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sku       = searchParams.get("sku") ?? "";
  const page      = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize  = Math.max(1, Number(searchParams.get("pageSize") ?? 10) || 10);
  const store     = searchParams.get("store") ?? "default";

  if (!sku) {
    return NextResponse.json({ reviews: null, error: "Missing sku" }, { status: 400 });
  }

  const r = await getProductReviewsPage({ sku, currentPage: page, pageSize, store });

  if (r.error || !r.reviews) {
    return NextResponse.json({ reviews: null, error: r.error ?? "Reviews unavailable" }, { status: r.status });
  }

  return NextResponse.json({ reviews: r.reviews });
}
