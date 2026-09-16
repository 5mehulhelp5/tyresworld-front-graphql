import type { Metadata } from "next";
import FaqPage from "@/components/faq/FaqPage";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | TyresWorld UAE",
  description:
    "Find answers to frequently asked questions about tyre buying, size specifications, order tracking, mobile fitting, and payment methods at TyresWorld UAE.",
  alternates: {
    canonical: "/faq",
    languages: {
      en: "/en/faq",
      ar: "/ar/faq",
    },
  },
};

export default function Page() {
  return <FaqPage />;
}
