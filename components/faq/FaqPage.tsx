"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
}

interface FaqCategory {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "tyres",
    title: "TYRES",
    titleAr: "الإطارات",
    icon: (
      <div className="w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
          {/* Tyre 1 (Bottom) */}
          <rect x="14" y="34" width="36" height="14" rx="4" fill="#374151" />
          <line x1="18" y1="34" x2="18" y2="48" stroke="#1f2937" strokeWidth="2" />
          <line x1="26" y1="34" x2="26" y2="48" stroke="#1f2937" strokeWidth="2" />
          <line x1="38" y1="34" x2="38" y2="48" stroke="#1f2937" strokeWidth="2" />
          <line x1="46" y1="34" x2="46" y2="48" stroke="#1f2937" strokeWidth="2" />
          {/* Tyre 2 (Top Stacked) */}
          <rect x="16" y="20" width="32" height="13" rx="3.5" fill="#4b5563" />
          <line x1="20" y1="20" x2="20" y2="33" stroke="#374151" strokeWidth="2" />
          <line x1="28" y1="20" x2="28" y2="33" stroke="#374151" strokeWidth="2" />
          <line x1="36" y1="20" x2="36" y2="33" stroke="#374151" strokeWidth="2" />
          <line x1="44" y1="20" x2="44" y2="33" stroke="#374151" strokeWidth="2" />
          {/* Wheel Disc in Background */}
          <circle cx="44" cy="18" r="13" fill="#10b981" />
          <circle cx="44" cy="18" r="7" fill="#047857" />
          <circle cx="44" cy="18" r="3" fill="#ffffff" />
          <path d="M44 5 L44 11 M44 25 L44 31 M31 18 L37 18 M51 18 L57 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    items: [
      {
        id: "tyres-1",
        question: "WHAT SHOULD I CONSIDER WHEN CHOOSING NEW TYRES?",
        questionAr: "ما الذي يجب مراعاته عند اختيار إطارات جديدة؟",
        answer:
          "When choosing new tyres, consider your vehicle type (sedan, SUV, 4x4, sports car), your typical driving conditions (city commuting, highway cruising, or desert off-roading), UAE weather resistance, exact tyre size specifications (found on your driver door placard or current tyre sidewall), speed rating, load index, and warranty coverage.",
        answerAr:
          "عند اختيار إطارات جديدة، ضع في اعتبارك نوع سيارتك (صالون، دفع رباعي، سيارة رياضية)، وظروف قيادتك اليومية (المدينة، الطرق السريعة، أو الطرق الوعرة)، ومقاومة حرارة الإمارات، ومقاس الإطار الدقيق، ومؤشر الحمولة والسرعة، والضمان المعتمد.",
      },
      {
        id: "tyres-2",
        question: "WHERE CAN I FIND MORE INFORMATION ABOUT THE TYRE BRANDS?",
        questionAr: "أين يمكنني العثور على مزيد من المعلومات حول ماركات الإطارات؟",
        answer:
          "You can explore our dedicated Brands section on TyresWorld to learn in detail about global manufacturers (Michelin, Pirelli, Bridgestone, Continental, Goodyear, Yokohama, Dunlop, Hankook, and more), their patented tread technologies, mileage ratings, and available OE patterns.",
        answerAr:
          "يمكنك تصفح قسم العلامات التجارية على تايرز وورلد لمعرفة كل التفاصيل حول أشهر الشركات العالمية (ميشلان، بيريللي، بريدجستون، كونتيننتال، جوديير، يوكوهاما وغيرها) وتقنياتها المبتكرة.",
      },
      {
        id: "tyres-3",
        question: "WHY DO SOME TYRES MENTION SPECIFIC VEHICLE MANUFACTURERS?",
        questionAr: "لماذا تحمل بعض الإطارات أسماء شركات سيارات محددة؟",
        answer:
          "Original Equipment (OE) tyres are custom-engineered in collaboration with car makers (such as 'MO' for Mercedes-Benz, '*' for BMW, 'N0/N1' for Porsche, 'AO' for Audi) to deliver the precise handling, noise reduction, and braking performance intended by the vehicle's engineers.",
        answerAr:
          "إطارات المعدات الأصلية (OE) تُصمم خصيصاً بالتعاون مع مصنعي السيارات (مثل MO لمرسيدس، * لبي إم دبليو، N لبورش) لتوفير الأداء والتحكم والهدوء المصمم خصيصاً لتلك السيارة.",
      },
      {
        id: "tyres-4",
        question: "WHAT DO XL AND REINFORCED MEAN ON A TYRE?",
        questionAr: "ماذا تعني رموز XL و REINFORCED على الإطار؟",
        answer:
          "XL (Extra Load) or Reinforced markings indicate that the tyre's internal structure has been strengthened to carry heavier loads at higher inflation pressures than a standard load tyre. They are common on SUVs, electric vehicles, and high-performance cars.",
        answerAr:
          "تشير رموز XL (Extra Load) أو Reinforced إلى أن هيكل الإطار مدعّم لتحمل أوزان أكبر وضغط هواء أعلى مقارنة بالإطارات العادية، وتُستخدم بكثرة في سيارات الدفع الرباعي والسيارات الكهربائية.",
      },
      {
        id: "tyres-5",
        question: "WHICH TYRES OFFER THE BEST MILEAGE?",
        questionAr: "ما هي الإطارات التي توفر أفضل عمر ومسافة قيادة؟",
        answer:
          "Premium touring tyres engineered with advanced silica compounds — such as Michelin Primacy, Bridgestone Turanza, Continental UltraContact, and Goodyear EfficientGrip — offer superior tread wear resistance, fuel efficiency, and long lifespan in hot UAE climates.",
        answerAr:
          "إطارات التورينج الفاخرة مثل ميشلان برايمسي، بريدجستون تورانزا، كونتيننتال ألتراكونتاكت وجوديير إفشنت جريب توفر أعلى معدل استهلاك بطيء للمداس وعمراً افتراضياً أطول في أجواء الإمارات.",
      },
      {
        id: "tyres-6",
        question: "DOES THE AGE OF A TYRE MATTER?",
        questionAr: "هل يؤثر عمر الإطار وتاريخ إنتاجه؟",
        answer:
          "Yes, rubber naturally hardens and oxidises over time. In the UAE, statutory guidelines recommend replacing tyres within 5 years from their manufacture date (DOT code). At TyresWorld, all supplied tyres come with fresh DOT production dates meeting strict ESMA/SASO standards.",
        answerAr:
          "نعم، يتأثر المطاط بالزمن والحرارة. تنص لوائح السلامة في الإمارات على ضرورة استبدال الإطارات التي يتجاوز عمرها 5 سنوات من تاريخ الصنع (DOT). جميع إطاراتنا جديدة ومطابقة للمواصفات القياسية.",
      },
    ],
  },
  {
    id: "order-process",
    title: "ORDER PROCESS",
    titleAr: "عملية الطلب",
    icon: (
      <div className="w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
          {/* Smartphone */}
          <rect x="18" y="10" width="28" height="46" rx="5" fill="#3b82f6" />
          <rect x="21" y="14" width="22" height="34" rx="2" fill="#e0f2fe" />
          <circle cx="32" cy="51" r="2" fill="#ffffff" />
          {/* Parcel Box */}
          <rect x="25" y="24" width="18" height="15" rx="2" fill="#f59e0b" />
          <path d="M25 29 L43 29 M34 24 L34 39" stroke="#d97706" strokeWidth="1.5" />
          {/* Map Pin on Box */}
          <path d="M34 16 C31.8 16 30 17.8 30 20 C30 23.5 34 27 34 27 C34 27 38 23.5 38 20 C38 17.8 36.2 16 34 16 Z" fill="#ef4444" />
          <circle cx="34" cy="20" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    items: [
      {
        id: "order-1",
        question: "HOW DOES BUYING FROM TYRESWORLD WORK?",
        questionAr: "كيف تتم عملية الشراء من تايرز وورلد؟",
        answer:
          "Buying from TyresWorld is seamless: (1) Find your tyres by size or vehicle, (2) Compare brands and choose your tyres, (3) Select your installation method (Free Mobile Doorstep Van fitting or at your nearest Certified Partner Centre), (4) Pick your date and time slot, and (5) Complete your order with secure online payment or Pay on Delivery.",
        answerAr:
          "الشراء سهل وبسيط: (1) ابحث عن مقاسك أو سيارتك، (2) اختر الإطارات المناسبة، (3) حدد طريقة التركيب (فان متنقل عند باب بيتك أو في أقرب مركز خدمة معتمد)، (4) اختر الموعد المناسب، (5) ادفع أونلاين بأمان أو عند الاستلام.",
      },
      {
        id: "order-2",
        question: "HOW CAN I TRACK MY ORDER?",
        questionAr: "كيف يمكنني تتبع طلبي؟",
        answer:
          "You can track your order status in real time by clicking on 'Track Order' in our website header or footer and entering your Order ID and email address. You will also receive live SMS and WhatsApp status updates as our mobile van or technician prepares your delivery.",
        answerAr:
          "يمكنك تتبع طلبك مباشرة عبر الضغط على 'تتبع الطلب' في أعلى أو أسفل الموقع بإدخال رقم الطلب والبريد الإلكتروني، أو من خلال الرسائل النصية ورسائل الواتساب الفورية.",
      },
      {
        id: "order-3",
        question: "CAN I CANCEL OR RESCHEDULE MY APPOINTMENT?",
        questionAr: "هل يمكنني إلغاء أو إعادة جدولة موعد التركيب؟",
        answer:
          "Yes, you can easily reschedule or cancel your fitting appointment free of charge up to 4 hours before the scheduled time by contacting our customer support team via WhatsApp at +971 50 506 9575 or phone.",
        answerAr:
          "نعم، يمكنك تغيير الموعد أو الإلغاء مجاناً قبل الموعد بـ 4 ساعات على الأقل عبر التواصل معنا على الواتساب 971505069575+.",
      },
      {
        id: "order-4",
        question: "DO YOU DELIVER AND INSTALL ACROSS ALL UAE EMIRATES?",
        questionAr: "هل تقدمون خدمات التوصيل والتركيب في جميع إمارات الدولة؟",
        answer:
          "Yes, we provide mobile doorstep fitting and partner installation services across Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.",
        answerAr:
          "نعم، نوفر خدمة الفان المتنقل ومراكز الخدمة المعتمدة في كافة أنحاء الإمارات (أبوظبي، دبي، الشارقة، عجمان، رأس الخيمة، الفجيرة، وأم القيوين).",
      },
    ],
  },
  {
    id: "tyre-installation",
    title: "TYRE INSTALLATION",
    titleAr: "تركيب الإطارات",
    icon: (
      <div className="w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
          {/* Hydraulic Lift Post */}
          <rect x="29" y="32" width="6" height="24" fill="#64748b" />
          <rect x="22" y="52" width="20" height="4" rx="1" fill="#475569" />
          <rect x="18" y="32" width="28" height="4" rx="1" fill="#3b82f6" />
          {/* Car on Lift */}
          <path d="M16 28 L22 18 L42 18 L48 28 Z" fill="#ef4444" />
          <circle cx="23" cy="28" r="3.5" fill="#1e293b" />
          <circle cx="41" cy="28" r="3.5" fill="#1e293b" />
          {/* Crossed Wrench & Spanner Top */}
          <path d="M12 12 L20 20 M20 12 L12 20" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M44 12 L52 20 M52 12 L44 20" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    items: [
      {
        id: "install-1",
        question: "WHAT IS INCLUDED IN TYRESWORLD'S INSTALLATION SERVICE?",
        questionAr: "ما الذي تشمله خدمة تركيب الإطارات من تايرز وورلد؟",
        answer:
          "Our standard fitting service includes tyre demounting and mounting, high-precision computerised wheel balancing, new standard rubber air valves, digital tyre pressure calibration, and eco-friendly disposal of your old tyres.",
        answerAr:
          "تشمل خدمة التركيب فك الإطارات القديمة وتركيب الجديدة، ترصيص ليزر إلكتروني دقيق للعجلات، استبدال بلوف الهواء، ضبط ضغط الإطارات، والتخلص الآمن من الإطارات القديمة.",
      },
      {
        id: "install-2",
        question: "HOW DOES MOBILE VAN DOORSTEP FITTING WORK?",
        questionAr: "كيف تعمل خدمة تركيب الإطارات المتنقلة عند باب البيت؟",
        answer:
          "Our custom-built mobile service van equipped with commercial tyre changers, high-speed balancers, and pneumatic tools arrives directly at your home, office, or designated parking spot. Our certified technicians complete the installation in 30-45 minutes while you relax.",
        answerAr:
          "تصلك شاحنة الخدمة المتنقلة المجهزة بأحدث أجهزة فك وتركيب وترصيص الإطارات إلى منزلك أو مقر عملك، ويقوم فنيونا المحترفون بإنهاء المهمة خلال 30 إلى 45 دقيقة بكل راحة وأمان.",
      },
      {
        id: "install-3",
        question: "DO I NEED WHEEL ALIGNMENT AFTER FITTING NEW TYRES?",
        questionAr: "هل أحتاج إلى ميزان العجلات بعد تركيب إطارات جديدة؟",
        answer:
          "Yes, we strongly recommend a 3D wheel alignment when replacing tyres. Proper alignment prevents premature or uneven tread wear, ensures your steering wheel stays perfectly straight, and improves fuel economy and safety.",
        answerAr:
          "نعم، نوصي بشدة بعمل ميزان 3D للعجلات عند تغيير الإطارات لضمان عدم تآكلها بشكل غير متساوٍ، وضمان استقامة التوجيه وسلامة القيادة وتوفير الوقود.",
      },
    ],
  },
  {
    id: "payment",
    title: "PAYMENT",
    titleAr: "طرق الدفع",
    icon: (
      <div className="w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
          {/* Smartphone with Checkmark */}
          <rect x="14" y="12" width="26" height="42" rx="4" fill="#3b82f6" />
          <rect x="17" y="16" width="20" height="30" rx="2" fill="#e0f2fe" />
          <circle cx="27" cy="30" r="7" fill="#10b981" />
          <path d="M24 30 L26.5 32.5 L30.5 27.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Credit Card Behind */}
          <rect x="28" y="22" width="26" height="18" rx="3" fill="#f59e0b" />
          <rect x="28" y="26" width="26" height="4" fill="#b45309" />
          <rect x="32" y="33" width="6" height="4" rx="1" fill="#fef3c7" />
        </svg>
      </div>
    ),
    items: [
      {
        id: "pay-1",
        question: "WHAT PAYMENT METHODS DO YOU ACCEPT?",
        questionAr: "ما هي طرق الدفع المتاحة؟",
        answer:
          "We accept Visa, MasterCard, Apple Pay, Tabby & Tamara (split into 4 interest-free monthly installments), Bank Transfer, and Cash or Card on Delivery directly to our mobile technician.",
        answerAr:
          "نقبل بطاقات فيزا، ماستركارد، أبل باي، تابي وتمارا (تقسيط على 4 دفعات بدون فوائد)، التحويل البنكي، والدفع نقداً أو بالبطاقة عند الاستلام مع فني التركيب.",
      },
      {
        id: "pay-2",
        question: "ARE THERE ANY HIDDEN CHARGES?",
        questionAr: "هل توجد أي رسوم خفية؟",
        answer:
          "No, all prices listed on TyresWorld are 100% transparent and all-inclusive. The price you see covers 5% UAE VAT, standard tyre mounting, wheel balancing, new valves, and environmental disposal fees.",
        answerAr:
          "لا توجد أي رسوم خفية إطلاقاً. الأسعار المعروضة شاملة ضريبة القيمة المضافة 5%، والتركيب، والترصيص، وبلوف الهواء الجديدة، والتخلص من الإطارات القديمة.",
      },
      {
        id: "pay-3",
        question: "IS MY ONLINE PAYMENT SECURE?",
        questionAr: "هل الدفع الإلكتروني آمن عبر موقعكم؟",
        answer:
          "Yes, your transactions are processed through UAE Central Bank-approved PCI-DSS Level 1 certified payment gateways with 256-bit SSL encryption and 3D Secure verification.",
        answerAr:
          "نعم، جميع المعاملات مشفرة ومحمية بأعلى معايير الأمان المصرفي العالمية (PCI-DSS) وموثقة بنظام الحماية ثلاثي الأبعاد (3D Secure).",
      },
    ],
  },
];

export default function FaqPage() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    // Keep first item open by default for nice visual
    "tyres-1": false,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const scrollToCategory = (categoryId: string) => {
    const el = document.getElementById(`faq-cat-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Top Hero Banner with Black Background ── */}
      <div className="relative w-full h-32 sm:h-36 md:h-44 bg-black flex items-center justify-center px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-wider text-center font-sans">
          {isAr
            ? "الأسئلة الشائعة | تايرز وورلد الإمارات"
            : "FREQUENTLY ASKED QUESTIONS | TYRESWORLD UAE"}
        </h1>
      </div>

      {/* ── Breadcrumb Bar ── */}
      <div className="bg-[#f0f0f0] border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link href={`/${locale}`} className="hover:text-black transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight size={12} className="text-gray-400 rtl:rotate-180" />
            <span className="text-gray-900 font-semibold">{isAr ? "الأسئلة الشائعة" : "FAQ"}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-14">
        {/* ── 4 Category Navigation Cards ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className="flex flex-col items-center justify-center w-32 sm:w-36 h-32 sm:h-36 bg-white border border-gray-200/90 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-[#ed1c24]/50 transition-all duration-200 group cursor-pointer"
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {cat.icon}
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-gray-950 mt-2 group-hover:text-[#ed1c24] transition-colors text-center font-sans">
                {isAr ? cat.titleAr : cat.title}
              </span>
            </button>
          ))}
        </div>

        {/* ── Categorized FAQ Sections ── */}
        <div className="space-y-12 sm:space-y-14">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.id} id={`faq-cat-${cat.id}`} className="scroll-mt-24">
              {/* Category Title */}
              <h2 className="text-lg sm:text-xl font-black uppercase text-gray-950 tracking-tight mb-4 sm:mb-5 font-sans">
                {isAr ? cat.titleAr : cat.title}
              </h2>

              {/* Accordion Rows */}
              <div className="space-y-2.5">
                {cat.items.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg bg-[#e8e8e8] border-l-4 border-l-[#ed1c24] rtl:border-l-0 rtl:border-r-4 rtl:border-r-[#ed1c24] overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Header Button */}
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 text-left rtl:text-right font-sans font-bold text-[13px] sm:text-[14px] text-gray-950 hover:text-[#ed1c24] transition-colors cursor-pointer outline-none select-none"
                      >
                        <span className="pr-4 rtl:pr-0 rtl:pl-4 uppercase tracking-tight leading-snug">
                          {isAr ? item.questionAr : item.question}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`text-gray-700 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-90 rtl:-rotate-90" : "rtl:rotate-180"
                          }`}
                        />
                      </button>

                      {/* Accordion Answer Content */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "max-h-[400px] opacity-100 bg-white border-t border-gray-200/80 px-5 sm:px-6 py-4"
                            : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                      >
                        <p className="text-xs sm:text-[13.5px] text-gray-700 leading-relaxed font-normal">
                          {isAr ? item.answerAr : item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
