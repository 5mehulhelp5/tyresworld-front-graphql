"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Clock, ArrowUp } from "lucide-react";

import { NavItem } from "@/src/config/navigation";

export default function Footer({ menu }: { menu?: NavItem[] }) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const [showTop, setShowTop] = useState(false);

  /* Reveal the back-to-top control once the user has scrolled a screenful. */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Extract dynamic categories and sub-items from Magento API menu
  const tyresItem = menu?.find((m) => m.id === "tyres" || m.slug === "tyres");
  /* "Special Tyre Offers" and "Car Battery Replacement" are static footer
     chrome (like infoLinks below) — real, working pages that aren't part of
     the Tyres menu entry itself. The items between them must come only from
     the real kleverMainMenu data; when Magento returns no children, we show
     just the two static links rather than a fabricated static submenu. */
  const productLinks: { label: string; labelAr?: string; href: string }[] = [
    { label: "Special Tyre Offers", labelAr: "عروض الإطارات المميزة", href: `/${locale}/special-offers` },
    ...(tyresItem?.children ?? []).map((c) => ({
      label: c.label,
      href: `/${locale}/${c.slug}`,
    })),
    { label: "Car Battery Replacement", labelAr: "استبدال بطارية السيارة", href: `/${locale}/car-battery-replacement` },
  ];

  const infoLinks: { label: string; labelAr?: string; href: string }[] = [
    { label: "About Us", labelAr: "من نحن", href: `/${locale}/about-us` },
    { label: "Car Service", labelAr: "خدمة السيارات", href: `/${locale}/car-service` },
    { label: "Contact Us", labelAr: "اتصل بنا", href: `/${locale}/contact` },
    { label: "Fitting & Installation Partner", labelAr: "شركاء التركيب والتركيب", href: `/${locale}/fitting-installation-partner` },
    { label: "FAQs", labelAr: "الأسئلة الشائعة", href: `/${locale}/faq` },
    { label: "Blog", labelAr: "المدونة", href: `/${locale}/blog` },
  ];

  return (
    <footer className="section site-footer page-footer bg-[#121011] text-[#a0a0a0] pt-9 sm:pt-11 pb-0 relative">
      <div className="container custom-width max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 pb-7 sm:pb-9">
          
          {/* Column 1: PRODUCT INFORMATION */}
          <div className="widget-col footer-links">
            <div className="widget">
              <div className="widget-title mb-3.5">
                <h3 className="text-white text-base sm:text-[16px] font-black uppercase tracking-wider m-0">
                  {isAr ? "معلومات " : "PRODUCT "}
                  <span className="text-[#ed1c24] theme_color">
                    {isAr ? "المنتجات" : "INFORMATION"}
                  </span>
                </h3>
              </div>
              <div className="menu-footer-nav1-container">
                <ul className="menu list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                  {productLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="hover:text-[#ed1c24] transition-colors">
                        {isAr && link.labelAr ? link.labelAr : link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2: PREMIUM TYRE */}
          <div className="widget-col footer-links">
            <div className="widget">
              <div className="widget-title mb-3.5">
                <h3 className="text-white text-base sm:text-[16px] font-black uppercase tracking-wider m-0">
                  {isAr ? "إطارات " : "PREMIUM "}
                  <span className="text-[#ed1c24] theme_color">
                    {isAr ? "فاخرة" : "TYRE"}
                  </span>
                </h3>
              </div>
              <div className="menu-footer-nav1-container">
                <ul className="menu list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                  <li>
                    <Link href={`/${locale}/tyres/brand/pirelli`} className="hover:text-[#ed1c24] transition-colors">
                      Pirelli
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/continental`} className="hover:text-[#ed1c24] transition-colors">
                      Continental
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/michelin`} className="hover:text-[#ed1c24] transition-colors">
                      Michelin
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/goodyear`} className="hover:text-[#ed1c24] transition-colors">
                      Goodyear
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/bridgestone`} className="hover:text-[#ed1c24] transition-colors">
                      Bridgestone
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/hankook`} className="hover:text-[#ed1c24] transition-colors">
                      Hankook
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/tyres/brand/kumho`} className="hover:text-[#ed1c24] transition-colors">
                      Kumho
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Why tyresworld.ae? */}
          <div className="widget-col footer-links">
            <div className="widget">
              <div className="widget-title mb-3.5">
                <h3 className="text-white text-base sm:text-[16px] font-black uppercase tracking-wider m-0">
                  {isAr ? "لماذا " : "Why "}
                  <span className="text-[#ed1c24] theme_color">
                    tyresworld.ae?
                  </span>
                </h3>
              </div>
              <div className="menu-footer-nav1-container">
                <ul className="menu list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                  {infoLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="hover:text-[#ed1c24] transition-colors">
                        {isAr && link.labelAr ? link.labelAr : link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 4: Website Information */}
          <div className="widget-col footer-links">
            <div className="widget">
              <div className="widget-title mb-3.5">
                <h3 className="text-white text-base sm:text-[16px] font-black uppercase tracking-wider m-0">
                  {isAr ? "معلومات " : "Website "}
                  <span className="text-[#ed1c24] theme_color">
                    {isAr ? "الموقع" : "Information"}
                  </span>
                </h3>
              </div>
              <div className="menu-footer-nav1-container">
                <ul className="menu list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                  <li>
                    <Link href={`/${locale}/terms-conditions`} className="hover:text-[#ed1c24] transition-colors">
                      {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/returns-exchanges`} className="hover:text-[#ed1c24] transition-colors">
                      {isAr ? "الإرجاع والاسترداد" : "Returns & Refund"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/warranty`} className="hover:text-[#ed1c24] transition-colors">
                      {isAr ? "الضمان" : "Warranty"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/privacy-policy`} className="hover:text-[#ed1c24] transition-colors">
                      {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/shipping-and-delivery-policy`} className="hover:text-[#ed1c24] transition-colors">
                      {isAr ? "سياسة الشحن والتوصيل" : "Shipping Policy"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 5: Get In Touch */}
          <div className="widget-col footer-contact">
            <div className="widget_text widget">
              <div className="widget-title mb-3.5">
                <h3 className="text-white text-base sm:text-[16px] font-black uppercase tracking-wider m-0">
                  {isAr ? "تواصل " : "Get In "}
                  <span className="text-[#ed1c24] theme_color">
                    {isAr ? "معنا" : "Touch"}
                  </span>
                </h3>
              </div>
              <div className="textwidget custom-html-widget text-xs leading-relaxed">
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  <li className="text-white/70 text-[12px]">
                    <b className="text-white block text-[13px] mb-0.5">DSP Trade Hub FZ-LLC</b>
                    Compass Building, Al Shohada Road,
                    AL Hamra Industrial Zone-FZ, 
                    Ras Al Khaimah, UAE
                    <br />
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://maps.app.goo.gl/tcDkQJXipiVixvZj8"
                      className="text-[#ed1c24] hover:underline font-semibold inline-block mt-0.5 text-xs"
                    >
                      {isAr ? "عرض على الخريطة" : "View on Map"}
                    </a>
                    <span className="block mt-0.5 text-[11px] text-white/50">License: 5033149 | TRN: 105036835400003</span>
                  </li>

                  <li>
                    <a href="mailto:info@tyresworld.ae" className="flex items-center gap-2 hover:text-[#ed1c24] transition-colors text-xs">
                      <Mail size={14} className="text-[#ed1c24] flex-shrink-0" />
                      info@tyresworld.ae
                    </a>
                  </li>

                  <li>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://api.whatsapp.com/send/?phone=971505069575&text=Hi%20tyresworld.ae"
                      className="flex items-center gap-2 hover:text-[#ed1c24] transition-colors text-xs font-semibold"
                    >
                      <svg className="w-3.5 h-3.5 fill-[#25D366] flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.452L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.115-2.89-6.984C16.279 1.89 13.802 1.865 11.2 1.865c-5.437 0-9.863 4.421-9.868 9.868-.001 1.714.452 3.39 1.31 4.877L1.625 21.82l5.022-1.317zm11.393-5.263c-.3-.149-1.772-.875-2.046-.975-.274-.1-.474-.149-.674.15-.2.299-.774.974-.949 1.173-.175.2-.35.224-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.793-1.488-1.77-1.663-2.07-.175-.3-.019-.461.13-.61.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.2.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      </svg>
                      +971 50 506 9575
                    </a>
                  </li>

                  <li className="flex items-start gap-2 text-white/70 text-xs">
                    <Clock size={14} className="text-[#ed1c24] flex-shrink-0 mt-0.5" />
                    <span>
                      Mon to Sat: 8:30 am - 6:00 pm
                      <br />
                      Sunday: Closed
                    </span>
                  </li>
                </ul>
              </div>

              {/* Social links */}
              <div className="social-links hover-circle mt-3.5">
                <div className="icon-lists list-custom flex items-center gap-2.5">
                  {/* Facebook */}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm overflow-hidden"
                    href="https://www.facebook.com/profile.php?id=61565576775985"
                    aria-label="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-sm overflow-hidden"
                    href="https://www.instagram.com/tyresworld.ae/"
                    aria-label="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-current transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Copyright strip */}
      <div className="footer-copyright bg-[#1e1e20] py-4 sm:py-5 border-t border-white/5">
        <div className="container custom-width max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4 xl:gap-6 text-center xl:text-left">

            {/* Copyright */}
            <div className="copyright">
              <span className="text-xs text-white/50 leading-relaxed">
                Copyright © {new Date().getFullYear()} tyresworld.ae (DSP Trade Hub FZ LLC). All rights reserved.
              </span>
            </div>

            {/* Quick links */}
            <ul className="copyright-links list-none flex flex-wrap items-center justify-center gap-x-5 gap-y-1 m-0 p-0">
              <li>
                <Link href={`/${locale}/tyres`} className="text-xs text-white/60 hover:text-[#ed1c24] transition-colors">
                  Car Tyres
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-xs text-white/60 hover:text-[#ed1c24] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-xs text-white/60 hover:text-[#ed1c24] transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/sitemap`} className="text-xs text-white/60 hover:text-[#ed1c24] transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>

            {/* Accepted payment methods */}
            <div className="payment-method">
              <ul className="list-none flex items-center justify-center xl:justify-end gap-2 m-0 p-0">
                {/* Visa */}
                <li aria-label="Visa" title="Visa">
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-hidden="true">
                    <rect width="48" height="32" rx="4" fill="#ffffff" />
                    <text x="24" y="21" textAnchor="middle" fontFamily="Kanit, Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="13" letterSpacing="0.5" fill="#1A1F71">VISA</text>
                  </svg>
                </li>
                {/* Mastercard */}
                <li aria-label="Mastercard" title="Mastercard">
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-hidden="true">
                    <rect width="48" height="32" rx="4" fill="#ffffff" />
                    <circle cx="20" cy="16" r="8.5" fill="#EB001B" />
                    <circle cx="28" cy="16" r="8.5" fill="#F79E1B" />
                    <path d="M24 9.6a8.5 8.5 0 0 0 0 12.8 8.5 8.5 0 0 0 0-12.8Z" fill="#FF5F00" />
                  </svg>
                </li>
                {/* Amazon Pay */}
                <li aria-label="Amazon Pay" title="Amazon Pay">
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-hidden="true">
                    <rect width="48" height="32" rx="4" fill="#ffffff" />
                    <text x="24" y="15" textAnchor="middle" fontFamily="Kanit, Arial, sans-serif" fontWeight="700" fontSize="8" fill="#232F3E">amazon</text>
                    <text x="24" y="25" textAnchor="middle" fontFamily="Kanit, Arial, sans-serif" fontWeight="700" fontSize="9" fill="#FF9900">pay</text>
                  </svg>
                </li>
                {/* Apple Pay */}
                <li aria-label="Apple Pay" title="Apple Pay">
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-hidden="true">
                    <rect width="48" height="32" rx="4" fill="#ffffff" />
                    <path d="M13.6 11.9c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8 0 1.5-.4 2-1Zm.7 1.1c-1.1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.7 1.7-1.2 2-.3 5 .8 6.6.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.5-.8 2.1-1.6.6-.9.9-1.8.9-1.9 0 0-1.7-.7-1.7-2.6 0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.2-2.4-1.2Z" fill="#000000" />
                    <text x="30" y="21" textAnchor="middle" fontFamily="Kanit, Arial, sans-serif" fontWeight="600" fontSize="11" fill="#000000">Pay</text>
                  </svg>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        className={`fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-[#ed1c24] text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-[#c6181d] hover:scale-110 ${
          showTop ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
}
