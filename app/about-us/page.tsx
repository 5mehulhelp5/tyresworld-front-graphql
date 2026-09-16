"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function AboutUsPage() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  return (
    <div className="bg-white" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Top Hero Banner with Title ── */}
      <div
        className="relative w-full h-36 sm:h-44 md:h-52 bg-black overflow-hidden flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/img/store-locator-banner.png'), linear-gradient(to right, #09090b, #111827)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider drop-shadow-md font-sans">
          {isAr ? "من نحن" : "ABOUT US"}
        </h1>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="bg-[#f0f0f0] border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link href={`/${locale}`} className="hover:text-black transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight size={12} className="text-gray-400 rtl:rotate-180" />
            <span className="text-gray-800 font-medium">{isAr ? "من نحن" : "About Us"}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-4xl space-y-8 text-gray-700">

          {/* Section 1: Welcome to TyresWorld */}
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-gray-950 tracking-tight mb-3">
              {isAr ? "مرحباً بكم في تايرز وورلد" : "WELCOME TO TYRESWORLD"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isAr
                ? "في تايرز وورلد، نحن هنا لنجعل شراء الإطارات أسهل وأكثر راحة للجميع في دولة الإمارات العربية المتحدة. بصفتنا متجراً إلكترونياً رائداً، نقدم طريقة سلسة لتسوق الإطارات من راحة منزلك، مقترنة بخدمات تركيب احترافية عبر شبكتنا الموثوقة من شركاء التركيب. نحن ملتزمون بالحفاظ على رحلاتك آمنة وسلسة دون أي عناء، ونوفر كل ما تحتاجه لسيارتك في مكان واحد."
                : "At TyresWorld, we're here to make buying tyres easier and more convenient for everyone in the UAE. As an online retailer, we offer a seamless way to shop for tyres from the comfort of your home, paired with expert fitment services through our trusted network of partner installers. We're dedicated to keeping your journeys smooth and hassle-free, offering everything you need for your vehicle in one place."}
            </p>
          </div>

          {/* Section 2: More Than A Tyre Shop */}
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-gray-950 tracking-tight mb-3">
              {isAr ? "أكثر من مجرد متجر إطارات" : "MORE THAN A TYRE SHOP"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isAr
                ? "تايرز وورلد ليست مجرد منصة لبيع الإطارات؛ بل هي تجربة متكاملة لأصحاب السيارات. يتم تشغيل تايرز وورلد بواسطة DSP Trade Hub FZ-LLC المسجلة في رأس الخيمة، الإمارات (ترخيص رقم: 5033149 | الرقم الضريبي: 105036835400003). يتولى فريقنا المتخصص كافة الخدمات من استبدال الإطارات إلى الصيانة الشاملة وتصليح السيارات، سواء كانت صيانة دورية بسيطة، أو تصليحات كبرى، أو خدمات تركيب جنوط السبائك المميزة. كما نوفر باقة من بطاريات السيارات الفاخرة من أفضل العلامات التجارية لضمان كفاءة سيارتك. سواء اخترت خدمة الفان المتنقل أو زيارة أحد مراكزنا، ستجد الجودة والراحة والاهتمام في كل خطوة."
                : "TyresWorld isn't just about selling tyres; it's about creating a better experience for car owners. TyresWorld is operated by DSP Trade Hub FZ-LLC, registered in Ras Al Khaimah, UAE (License No. 5033149 | TRN 105036835400003). Our professional team handles everything from tyre replacements to full car repairs and services. Whether it's a simple tune-up, major vehicle repairs, or specialised services like alloy wheel installations, we've got you covered. We also offer a range of premium car batteries from top brands to keep your vehicle powered and reliable. Whether you choose our mobile van service or visit one of our workshops, you'll find quality, convenience, and care every step of the way."}
            </p>
          </div>

          {/* Section 3: What Makes Us Different */}
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-gray-950 tracking-tight mb-4">
              {isAr ? "ما الذي يميزنا" : "WHAT MAKES US DIFFERENT"}
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "إطارات عالمية موثوقة" : "Branded Tyres You Can Trust"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "تشكيلة واسعة من الإطارات الفاخرة من أشهر الماركات العالمية المصممة لأعلى مستويات الجودة والمتانة والأمان."
                    : "A wide selection of premium tyres from globally recognised brands, built for quality, durability, and safety on every journey."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "بطاريات عالية الجودة" : "High-Quality Batteries"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "اختر من بين أفضل ماركات بطاريات السيارات الموثوقة للأداء الدائم."
                    : "Choose from top car battery brands, built for lasting performance and reliability."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "جنوط سبائك لكافة الأنماط" : "Alloy Wheels for Every Style"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "جنوط سبائك أنيقة ومتينة تتناسب مع تصميم سيارتك في كافة الفئات."
                    : "Stylish, durable alloy wheels to match your vehicle, in every type we stock."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "عناية شاملة بالسيارة" : "Comprehensive Car Care"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "من استبدال الإطارات إلى أعمال الصيانة والتصليح الشامل، فريقنا جاهز لخدمتك."
                    : "From tyre replacements to full repairs and servicing, our team covers it all."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "أقصى درجات الراحة" : "Convenience at Its Best"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "تسوق الإطارات أونلاين، واحجز التركيب في أقرب مركز معتمد أو اطلب الفان المتنقل ليصلك أينما كنت."
                    : "Shop tyres online, book fitting at your nearest partner installer, or let our mobile van come to you."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "تميز بأسعار مناسبة" : "Affordable Excellence"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "أسعار تنافسية مقترنة بأعلى جودة للمنتجات والخدمات لقيمة حقيقية."
                    : "Competitive pricing paired with top-quality products and service, for genuine value."}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-gray-900 font-bold">
                    {isAr ? "دعم يركز على العميل" : "Customer-Focused Support"}
                  </strong>
                  {" — "}
                  {isAr
                    ? "فريقنا مستعد دائماً لمساعدتك في اختيار الإطارات أو البطاريات أو الخدمات الأنسب لسيارتك."
                    : "Our team is always ready to help you choose the right tyres, batteries, or services for your needs."}
                </span>
              </li>
            </ul>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-4">
              {isAr
                ? "في تايرز وورلد، نجعل العثور على الإطارات المميزة والبطاريات والجنوط والخدمة الموثوقة أمراً بسيطاً وسريعاً — لتنطلق على الطريق بثقة تامة."
                : "At TyresWorld, we make it simple to find high-quality branded tyres, car batteries, alloy wheels, and reliable service — so you can drive with confidence wherever the road takes you."}
            </p>
          </div>

          {/* Section 4: A Partner You Can Rely On */}
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-gray-950 tracking-tight mb-3">
              {isAr ? "شريك يمكنك الاعتماد عليه" : "A PARTNER YOU CAN RELY ON"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isAr
                ? "في تايرز وورلد، نحن شغوفون بتقديم إطارات فائقة الجودة وخدمة مخلصة. سواء كنت تستبدل إطارات مستهلكة، أو ترغب في ترقية سيارتك، أو تبحث عن صيانة متخصصة، نحن هنا لمساعدتك. انضم إلى الآلاف من السائقين في جميع أنحاء الإمارات الذين يثقون بنا للحفاظ على سلامة سياراتهم وجاهزيتها للطريق."
                : "At TyresWorld, we're passionate about delivering top-quality tyres and genuinely helpful service. Whether you're replacing worn-out tyres, upgrading your vehicle, or looking for expert car care, we're here to help. Join the growing number of drivers across the UAE who trust us to keep their vehicles safe and road-ready."}
            </p>

            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-4">
              {isAr
                ? "قُد بذكاء مع تايرز وورلد. نحن نوفر لك كل ما تحتاجه."
                : "Drive smarter with TyresWorld. We've got you covered."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
