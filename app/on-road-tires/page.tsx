import { redirect } from "next/navigation";

// Legacy non-locale URL. "on-road-tires" itself no longer resolves to a
// distinct page — Magento has no real attribute distinguishing on-road from
// off-road/4x4 tyres, so this now goes straight to the real Tyres category.
export default function OnRoadTiresRedirect() {
  redirect("/en/tyres");
}
