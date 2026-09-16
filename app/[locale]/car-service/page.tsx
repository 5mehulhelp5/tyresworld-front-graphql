import type { Metadata } from "next";
import CarServicesPage from "@/components/service/CarServicesPage";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "خدمات وتصليح السيارات في أبوظبي | تايرز وورلد"
      : "Expert Car Repairs & Services in Abu Dhabi | TyresWorld",
    description: isAr
      ? "خدمات تصليح وصيانة السيارات الاحترافية في أبوظبي من كارولين أوتو كير ذ.م.م - مركز خدمة تايرز وورلد. إطارات، بطاريات، تكييف، فرامل، وتغيير الزيت."
      : "Professional car repair & maintenance services in Abu Dhabi by Carolyn Auto Care – L.L.C – S.P.C, service hub of TyresWorld. Tyre service, battery, AC, brakes, oil change, alignment & rim repair.",
    alternates: {
      canonical: `/${params.locale}/car-service`,
      languages: {
        en: "/en/car-service",
        ar: "/ar/car-service",
      },
    },
  };
}

export default function Page() {
  return <CarServicesPage />;
}
