import { APP_CONFIG } from "@/src/config/app-config";

/**
 * Vehicle-make logo assets live on the storefront's static Magento theme
 * folder (Hdweb_Vehicles), which sits behind HTTP Basic Auth *and*
 * Cloudflare — the latter blocks/challenges Vercel's serverless IP ranges,
 * so a live server-side proxy (the old /api/vehicle-logo route) works
 * locally but 403s in production even with correct credentials.
 *
 * Fix: the real make logos this store actually needs (same finite set
 * /api/vehicles' real make list resolves to, confirmed against the live
 * origin) have been downloaded once into public/vehicle-logos/ — same
 * real assets, served as ordinary static files, no live fetch, no
 * Cloudflare dependency. A make with no local file just shows the
 * generic car icon (VehicleLogo's own error state) — an honest empty
 * state, not an external third-party logo service.
 */
export const MAGENTO_ORIGIN = APP_CONFIG.magento.graphqlUrl.replace(/\/graphql\/?$/, "");

/** No longer used by vehicleLogoProxyUrl (see above) — kept only because
    the old /api/vehicle-logo route (now unreachable in normal use) still
    imports it; left in place rather than touching that route file. */
export const VEHICLE_LOGO_BASE =
  `${MAGENTO_ORIGIN}/static/frontend/Klever/automotive/en_US/Hdweb_Vehicles/images/logo`;

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,60}[a-z0-9])?$/i;

/** true for a safe, non-traversable make slug like "bmw" or "aston-martin". */
export function isValidVehicleLogoSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Local static asset — same real logo, no live proxy fetch. */
export function vehicleLogoProxyUrl(slug: string): string {
  return `/vehicle-logos/${encodeURIComponent(slug)}.png`;
}
