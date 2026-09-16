import { NextRequest, NextResponse } from "next/server";
import { getFaqData } from "@/lib/services/faq.service";
import { storeCode } from "@/lib/i18n";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const store = storeCode(locale);

  const groups = await getFaqData(store);

  return NextResponse.json(
    { groups },
    { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=600" } },
  );
}
