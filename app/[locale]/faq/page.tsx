import type { Metadata } from "next";
import FaqPage from "@/components/faq/FaqPage";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "الأسئلة الشائعة (FAQ) | تايرز وورلد الإمارات"
      : "Frequently Asked Questions (FAQ) | TyresWorld UAE",
    description: isAr
      ? "اعثر على إجابات للأسئلة الشائعة حول شراء الإطارات ومقاساتها وتتبع الطلبات والتركيب المتنقل وطرق الدفع في تايرز وورلد الإمارات."
      : "Find answers to frequently asked questions about tyre buying, size specifications, order tracking, mobile fitting, and payment methods at TyresWorld UAE.",
    alternates: {
      canonical: `/${params.locale}/faq`,
      languages: {
        en: "/en/faq",
        ar: "/ar/faq",
      },
    },
  };
}

export default function Page() {
  return <FaqPage />;
}
