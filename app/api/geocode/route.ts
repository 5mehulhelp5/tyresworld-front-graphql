import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat or lng" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "TyresWorld-StoreLocator/1.0 (info@tyresworld.ae)",
        "Accept-Language": "en,ar",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ address: `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` });
    }

    const data = await res.json();
    const address = data?.display_name || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    const city =
      data?.address?.city ||
      data?.address?.state_district ||
      data?.address?.state ||
      data?.address?.town ||
      "";

    return NextResponse.json({
      address,
      city,
      raw: data?.address,
    });
  } catch (err) {
    return NextResponse.json({
      address: `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
      error: err instanceof Error ? err.message : "Geocode error",
    });
  }
}
