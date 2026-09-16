import type { Metadata } from "next";
import CarServicesPage from "@/components/service/CarServicesPage";

export const metadata: Metadata = {
  title: "Expert Car Repairs & Services in Abu Dhabi | TyresWorld",
  description:
    "Professional car repair & maintenance services in Abu Dhabi by Carolyn Auto Care – L.L.C – S.P.C, service hub of TyresWorld. Tyre service, battery, AC, brakes, oil change, alignment & rim repair.",
  alternates: {
    canonical: "/car-service",
    languages: {
      en: "/en/car-service",
      ar: "/ar/car-service",
    },
  },
};

export default function Page() {
  return <CarServicesPage />;
}
