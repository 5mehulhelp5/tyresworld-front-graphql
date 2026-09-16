/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle the brand logo tree into the /api/brands serverless function.
  // findBrandLogo() scans these files with fs at runtime; without this,
  // public/ assets aren't in the function's filesystem on Vercel, so no
  // brand ever resolves a logo and the Shop-by-Brands grid comes up empty.
  experimental: {
    outputFileTracingIncludes: {
      "/api/brands": ["./public/brands/mgs_brand/**/*"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Magento store images (API product images)
      { protocol: "https", hostname: "autoono-demo.btire.com" },
      { protocol: "https", hostname: "tyrescart.ae" },
      { protocol: "https", hostname: "**.tyrescart.ae" },
      { protocol: "https", hostname: "www1.tyresworld.ae" },
      { protocol: "https", hostname: "www.tyresworld.ae" },
    ],
  },
  async redirects() {
    return [
      /* The real main menu (kleverMainMenu, see lib/services/menu.service.ts)
         links "Tyres by Brand" to /brand — that's a real live page (Magento
         admin's own menu module), but not one Magento's route/urlResolver
         GraphQL query can resolve (same "real page, ungettable via GraphQL"
         situation as car-battery-replacement and /faq). We already have the
         real brand-listing content at /brands (app/[locale]/brands), so
         redirect the menu's real URL there instead of 404ing. */
      {
        source: "/:locale(en|ar)/brand",
        destination: "/:locale/brands",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
