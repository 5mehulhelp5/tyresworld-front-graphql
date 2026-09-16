import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { navHref, navLabel } from "@/src/config/navigation";
import { getMainMenu } from "@/lib/services/menu.service";
import { storeCode } from "@/lib/i18n";

const ICONS: Record<string, string> = {
  "svc-tyre": "/service-icons/service-icons-01.png",
  "svc-battery": "/service-icons/service-icons-03.png",
  "svc-ac": "/service-icons/service-icons-06.png",
  "svc-brake": "/service-icons/service-icons-04.png",
  "svc-oil": "/service-icons/service-icons-05.png",
  "svc-mech": "/service-icons/service-icons-08.png",
  "svc-alignment": "/service-icons/service-icons-02.png",
  "svc-balancing": "/service-icons/service-icons-02.png",
  "svc-rim": "/service-icons/service-icons-07.png",
};

export default async function ServicesGrid({ locale = "en" }: { locale?: string }) {
  const isAr = locale === "ar";
  const menu = await getMainMenu(storeCode(isAr ? "ar" : "en"));
  const group = menu?.find((item) => item.id.includes("service") || item.slug.includes("service"));
  const services = group?.children ?? [];

  if (services.length === 0) return null;

  return (
    <section className="ptr-section ptr-services">
      <div className="ptr-container">
        <header className="ptr-head">
          <div>
            <p className="ptr-services-eyebrow">
              <span aria-hidden="true" />
              {isAr ? "خدمات السيارات" : "CAR SERVICES"}
            </p>
            <h2 className="ptr-h2">
              {isAr ? "كل ما تحتاجه سيارتك" : "Everything your car needs"}
            </h2>
            <p className="ptr-sub">
              {isAr
                ? "فنيون معتمدون ومرفق مجهز بالكامل — خدمات سيارات شاملة في أبوظبي وجميع أنحاء الإمارات."
                : "Certified technicians and a fully equipped facility — complete car servicing in Abu Dhabi and across the UAE."}
            </p>
          </div>

          {group && (
            <Link href={navHref(group, locale)} className="ptr-link">
              {isAr ? "عرض جميع الخدمات" : "View all services"}
              <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
          )}
        </header>

        <ul className="ptr-services-grid">
          {services.map((service) => (
            <li key={service.id}>
              <Link href={navHref(service, locale)} className="ptr-service-card">
                <span className="ptr-service-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ICONS[service.id] ?? "/service-icons/service-icons-08.png"}
                    alt=""
                    aria-hidden="true"
                    width={417}
                    height={417}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="ptr-service-label">{navLabel(service, locale)}</span>
                <span className="ptr-service-go" aria-hidden="true">
                  <ArrowRight size={14} strokeWidth={2.4} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
