import { NextRequest, NextResponse } from "next/server";
import { MISC_MUTATIONS } from "@/lib/mutations";
import { APP_CONFIG, magentoHeaders } from "@/src/config/app-config";

/* POST /api/request-callback
 * body: { name, number }
 * Dedicated "Request a Callback" enquiry (kleverRequestCallback, Klever
 * module) — separate from the general contactUs form; saves to Magento's
 * own admin enquiry grid. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const { name, number } = body as { name?: string; number?: string };

  if (!name || !number) {
    return NextResponse.json(
      { ok: false, error: "name and number are required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(APP_CONFIG.magento.graphqlUrl, {
      method:  "POST",
      headers: magentoHeaders(),
      body:    JSON.stringify({
        query:     MISC_MUTATIONS.requestCallback,
        variables: { input: { name, number } },
      }),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.errors?.length) {
      return NextResponse.json(
        { ok: false, error: json?.errors?.[0]?.message ?? `HTTP ${res.status}` },
        { status: res.ok ? 200 : res.status },
      );
    }

    const result = json?.data?.kleverRequestCallback as
      | { success?: boolean; message?: string; enquiry_id?: number }
      | undefined;

    return NextResponse.json({
      ok: result?.success === true,
      error: result?.success === true ? undefined : (result?.message ?? "Request failed"),
      enquiryId: result?.enquiry_id,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Network error" },
      { status: 502 },
    );
  }
}
