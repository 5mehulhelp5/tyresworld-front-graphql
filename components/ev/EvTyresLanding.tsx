"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Check,
} from "lucide-react";

export default function EvTyresLanding() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const FAQS = [
    {
      q: isAr ? "هل تحتاج السيارات الكهربائية إلى إطارات خاصة؟" : "Do electric cars need special tyres?",
      a: isAr
        ? "نعم. السيارات الكهربائية أثقل من سيارات البنزين بسبب بطارياتها، كما أنها تولد عزم دوران فوري. الإطارات العادية تتآكل بشكل أسرع في هذه الظروف، لذا صُممت إطارات السيارات الكهربائية بهيكل مقوى وتخميد إضافي للضوضاء لتحمل الوزن وعزم الدوران العالي بكل راحة."
        : "Yes. EVs are heavier than petrol cars because of their battery packs, and they deliver power more suddenly. Standard tyres wear out faster under those conditions, so EV-specific tyres use reinforced construction and added noise reduction to handle the extra weight and torque comfortably.",
    },
    {
      q: isAr ? "كيف تساعد إطارات السيارات الكهربائية في زيادة مدى البطارية؟" : "How do EV tyres help with battery range?",
      a: isAr
        ? "تم تصميم إطارات السيارات الكهربائية بمقاومة منخفضة للدوران، مما يعني أنها تستهلك طاقة أقل أثناء الحركة، وهذا ينعكس مباشرة على زيادة مدى القيادة لكل شحنة مقارنة بالإطارات العادية."
        : "EV tyres are built with low rolling resistance, meaning they require less energy to keep moving. That translates directly into better range per charge compared to a standard tyre.",
    },
    {
      q: isAr ? "هل يمكنني استخدام إطارات عادية على سيارتي الكهربائية؟" : "Can I use regular tyres on my electric car?",
      a: isAr
        ? "يمكنك ذلك ولكن هذا ليس الخيار المثالي. فالإطارات العادية ستتآكل بسرعة أكبر نظراً للوزن الزائد وعزم الدوران الفوري، وستلاحظ ضوضاء أعلى على الطريق مع انخفاض طفيف في مدى البطارية."
        : "You can, but it isn't ideal. Regular tyres tend to wear out faster on an EV due to the extra weight and torque, and you'll likely notice more road noise and slightly reduced range compared to an EV-specific tyre.",
    },
    {
      q: isAr ? "كم مرة يجب فحص إطارات سيارتي الكهربائية في الإمارات؟" : "How often should I get my EV tyres checked in Abu Dhabi?",
      a: isAr
        ? "كدليل عام، يُنصح بفحص الإطارات كل 10,000 كم أو قبل الرحلات الطويلة إلى دبي أو العين. حرارة الصيف قد تسرع من تآكل الإطارات، لذا يساعد الفحص الدوري في اكتشاف أي مشكلة مبكراً."
        : "As a general guide, have your tyres inspected every 10,000 km or so, and always before a long trip out toward Al Ain or Dubai. Abu Dhabi's summer heat can accelerate wear, so regular checks help catch problems before they become safety issues.",
    },
    {
      q: isAr ? "ما الذي يجب مراعاته عند شراء إطارات جديدة للسيارات الكهربائية؟" : "What should I check for when buying new EV tyres in Abu Dhabi?",
      a: isAr
        ? "تأكد من المقاس الصحيح، ومؤشر الحمولة المناسب لوزن السيارة، وميزات مثل تقليل الضوضاء ومقاومة الدوران المنخفضة المناسبة للمناخ الحار في الإمارات."
        : "Look for the correct size for your vehicle, a load rating that matches your EV's weight, and features like low rolling resistance and noise reduction — these matter more for EVs than for petrol cars, especially given Abu Dhabi's heat.",
    },
    {
      q: isAr ? "هل إطارات السيارات الكهربائية أكثر هدوءاً من الإطارات العادية؟" : "Are EV tyres quieter than regular tyres?",
      a: isAr
        ? "نعم، بشكل عام. تحتوي معظم إطارات السيارات الكهربائية على طبقات من الفوم العازل للصوت لأن صوت احتكاك الطريق يكون ملحوظاً جداً داخل المقصورة الصامتة للسيارة الكهربائية."
        : "Yes, generally. Most EV tyres include sound-dampening foam or acoustic layers specifically because road noise is much more noticeable in an EV's near-silent cabin.",
    },
  ];

  const EV_TYRES = [
    {
      brandLogo: "/images/ev/kumho-logo_1.png",
      brandName: "KUMHO",
      title: "KUMHO ECSTA PS71 EV",
      subtitle: isAr
        ? "قيادة يومية متوازنة تجمع بين الأداء العالي والراحة والاستهلاك الفعال للطاقة"
        : "Everyday EV driving with a balance of performance, comfort, and efficient energy use",
      image: "/images/ev/ev-tyre-1.jpg",
      features: [
        isAr ? "مركب هجين عالي القوة" : "High-strength hybrid compound",
        isAr ? "مزيج بوليمر منخفض مقاومة الدوران" : "Low rolling resistance polymer blend",
        isAr ? "تقنية K-Silent لخفض الضوضاء" : "K-Silent noise reduction",
      ],
      link: `/${locale}/tyres?mgs_brand=Kumho&ev_tyre=EV`,
      buttonLabel: isAr ? "تسوق إطارات كومهو" : "SHOP KUMHO TYRE",
    },
    {
      brandLogo: "/images/ev/winrun.png",
      brandName: "WINRUN",
      title: "WINRUN R330 EV",
      subtitle: isAr
        ? "قيادة هادئة وموفرة للطاقة مع استجابة وتحكم ممتازين على الطريق"
        : "Quiet, energy-efficient driving with dependable road response",
      image: "/images/ev/winrun-tyre.jpg",
      features: [
        isAr ? "تقنية Wi-Silent لعزل الصوت" : "Wi-Silent noise reduction",
        isAr ? "هيكل محسن لكفاءة الدوران" : "Optimized rolling efficiency structure",
        isAr ? "نمط مداس غير متماثل للثبات" : "Asymmetric grip pattern",
      ],
      link: `/${locale}/tyres?mgs_brand=Winrun&ev_tyre=EV`,
      buttonLabel: isAr ? "تسوق إطارات وينرن" : "SHOP WINRUN TYRE",
    },
    {
      brandLogo: "/images/ev/pirelli-tyre-shop_1.png",
      brandName: "PIRELLI",
      title: "PIRELLI P ZERO PZ4",
      subtitle: isAr
        ? "للسيارات الكهربائية عالية الأداء التي تتطلب تحكماً دقيقاً واستجابة ديناميكية"
        : "High-performance EVs that need sharp control and dynamic response",
      image: "/images/ev/ev-tyre-3.jpg",
      features: [
        isAr ? "تكنولوجيا القيادة الكهربائية ELECT™" : "ELECT™ electric driving technology",
        isAr ? "نظام إلغاء الضوضاء (PNCS™)" : "Noise-cancelling system (PNCS™)",
        isAr ? "حماية الإطارات الذاتية Seal-Inside" : "Seal-Inside puncture protection",
      ],
      link: `/${locale}/tyres?mgs_brand=Pirelli&ev_tyre=EV`,
      buttonLabel: isAr ? "تسوق إطارات بيريللي" : "SHOP PIRELLI TYRE",
    },
    {
      brandLogo: "/images/ev/michelin-tyres-shop_1.png",
      brandName: "MICHELIN",
      title: "MICHELIN PILOT SPORT EV",
      subtitle: isAr
        ? "للسائقين الباحثين عن الثبات والكفاءة وراحة الركوب الاستثنائية في إطار واحد"
        : "Drivers who want grip, efficiency, and ride comfort in one tyre",
      image: "/images/ev/ev-tyre-4.jpg",
      features: [
        isAr ? "مركب ElectricGrip المتطور" : "ElectricGrip compound",
        isAr ? "تكنولوجيا الراحة الصوتية Acoustic" : "Acoustic comfort technology",
        isAr ? "تصميم منخفض مقاومة التدحرج" : "Low rolling resistance design",
      ],
      link: `/${locale}/tyres?mgs_brand=Michelin&ev_tyre=EV`,
      buttonLabel: isAr ? "تسوق إطارات ميشلان" : "SHOP MICHELIN TYRE",
    },
  ];

  const POPULAR_CARS = [
    {
      name: "TESLA MODEL 3",
      image: "/images/ev/ev-tyre-5.jpg",
      desc: isAr
        ? "قيادة يومية سلسة مع تسارع قوي وتحكم موثوق"
        : "Smooth daily driving with strong acceleration and reliable control",
      recommended: ["Michelin Pilot Sport EV", "Continental EcoContact 6", "Hankook iON evo"],
      link: `/${locale}/tyres/cars?make=tesla&model=model-3`,
      buttonLabel: isAr ? "استكشف إطارات تسلا موديل 3" : "EXPLORE TESLA MODEL 3",
    },
    {
      name: "TESLA MODEL S",
      image: "/images/ev/ev-tyre-6.jpg",
      desc: isAr
        ? "أداء قيادة رياضي فائق مع أعلى مستويات الراحة والفخامة"
        : "Powerful performance driving with premium comfort",
      recommended: ["Pirelli P Zero PZ4", "Michelin Pilot Sport 4", "Continental PremiumContact 6"],
      link: `/${locale}/tyres/cars?make=tesla&model=model-s`,
      buttonLabel: isAr ? "استكشف إطارات تسلا موديل اس" : "EXPLORE TESLA MODEL S",
    },
    {
      name: "TESLA MODEL Y",
      image: "/images/ev/ev-tyre-7.jpg",
      desc: isAr
        ? "سيارة عائلية مثالية بسعة تحميل أعلى وركوب مريح وهادئ"
        : "Family and city driving with higher load capacity and a smooth ride",
      recommended: ["Pirelli Scorpion Zero", "Michelin Latitude Sport", "Continental CrossContact"],
      link: `/${locale}/tyres/cars?make=tesla&model=model-y`,
      buttonLabel: isAr ? "استكشف إطارات تسلا موديل واي" : "EXPLORE TESLA MODEL Y",
    },
    {
      name: "VOLKSWAGEN ID.4",
      image: "/images/ev/ev-tyre-8.jpg",
      desc: isAr
        ? "قيادة كهربائية متوازنة مع ضوضاء منخفضة واستجابة توجيه ثابتة"
        : "Balanced electric driving with reduced road noise and stable steering response.",
      recommended: ["Kumho Ecsta PS71", "Winrun R330", "Michelin e.Primacy"],
      link: `/${locale}/tyres/cars?make=volkswagen&model=id-4`,
      buttonLabel: isAr ? "استكشف إطارات فولكس فاجن ID.4" : "EXPLORE VOLKSWAGEN ID.4",
    },
  ];

  const PICK_BOXES = [
    { icon: "/images/ev/wather-icon.png", title: isAr ? "ثبات قوي" : "Strong Grip" },
    { icon: "/images/ev/tire-control.png", title: isAr ? "تحكم واثق" : "Confident Handling" },
    { icon: "/images/ev/performance-icon.png", title: isAr ? "أداء ثابت" : "Consistent Performance" },
    { icon: "/images/ev/durability-icon.png", title: isAr ? "عمر أطول للمداس" : "Built to Last" },
    { icon: "/images/ev/energy-efficiency.png", title: isAr ? "كفاءة طاقة أفضل" : "Better Energy Efficiency" },
    { icon: "/images/ev/low-noise.png", title: isAr ? "ركوب أكثر هدوءاً" : "A Quieter Ride" },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="bg-white text-gray-900 font-sans">
      {/* ── 1. Page Title Wrapper (Exact solid black banner) ── */}
      <div className="bg-black py-16 sm:py-24 text-center">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black uppercase text-white tracking-wider">
            {isAr ? "إطارات السيارات الكهربائية في الإمارات" : "ELECTRIC VEHICLE TYRES IN UAE"}
          </h1>
        </div>
      </div>

      {/* ── 2. Breadcrumbs (Exact light gray bar) ── */}
      <div className="bg-[#e9e9e9] border-b border-gray-300/80 py-2.5">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-700 font-medium">
            <Link href={`/${locale}`} className="hover:text-black transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <span className="text-gray-500 font-bold">&gt;</span>
            <span className="text-gray-950 font-bold">
              {isAr ? "إطارات السيارات الكهربائية" : "EV Tyres"}
            </span>
          </nav>
        </div>
      </div>

      {/* ── 3. Top Content: Shop EV Tyres + Description + What Makes EV Ready ── */}
      <section className="pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-gray-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Centered Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black uppercase tracking-tight text-gray-950 leading-tight">
              {isAr ? "تسوق إطارات السيارات الكهربائية في أبوظبي " : "SHOP EV TYRES IN ABU DHABI "}
              <span className="text-[#ed1c24]">
                {isAr ? "المصممة للسيارات الكهربائية وسيارات الدفع الرباعي" : "BUILT FOR ELECTRIC CARS & SUVS"}
              </span>
            </h2>
            <p className="text-xs sm:text-[13.5px] font-bold text-gray-900 mt-2 max-w-3xl mx-auto">
              {isAr
                ? "إطارات مصممة خصيصاً لزيادة مدى البطارية، وتوفير تماسك أقوى، وركوب أكثر هدوءاً، متوافقة مع طرق ومناخ أبوظبي."
                : "Purpose-built tyres for better range, stronger grip, and a quieter ride, matched to Abu Dhabi's roads and climate."}
            </p>
          </div>

          {/* Intro Paragraphs */}
          <div className="max-w-6xl mx-auto text-xs sm:text-[12.5px] text-gray-700 leading-relaxed space-y-3 mb-10 text-start">
            <p>
              {isAr
                ? "أصبحت السيارات الكهربائية مشهداً مألوفاً في جميع أنحاء أبوظبي، من التنقل اليومي على طول الكورنيش إلى الرحلات الأسبوعية نحو العين أو دبي عبر طريق E11. مهما كانت سيارتك، فإن سيارتك الكهربائية تتطلب من إطاراتها أكثر مما تطلبه سيارة البنزين العادية — فهي تحتاج إلى ثبات فوري، ومقاومة حقيقية للحرارة، وإطارات تصمد ميلاً بعد ميل في مناخ أبوظبي."
                : "Electric vehicles are becoming a common sight across Abu Dhabi, from the daily commute along the Corniche to weekend runs out toward Al Ain or over to Dubai on the E11. Whatever you drive, your EV asks more of its tyres than a regular petrol car does — it needs instant grip, real heat resistance, and tyres that hold up mile after mile in Abu Dhabi's climate."}
            </p>
            <p>
              {isAr
                ? "هذا لأن السيارات الكهربائية لا تتصرف مثل سيارات محركات الاحتراق. فهي تتسارع بشكل أسرع، وتحمل حزمة بطاريات أثقل وزناً، وتسير في صمت شبه تام — لذا فإن الإطار المصنوع لمحرك عادي يتآكل بشكل أسرع، ويصدر صوتاً أعلى، ويعيق السيارة عن تقديم الأداء المطلوب. صُممت إطارات السيارات الكهربائية خصيصاً للتغلب على هذه الفروق، لتمنح سيارتك الكهربائية المدى والراحة والأمان الذي صُممت من أجله، هنا في أبوظبي."
                : "That's because EVs don't behave like combustion-engine cars. They accelerate faster, carry a heavier battery pack, and run near-silent — so a tyre built for a normal engine wears out faster, feels noisier, and holds the car back from performing the way it should. EV tyres are engineered around these differences, so your electric vehicle gets the range, comfort, and safety it was designed for, right here in Abu Dhabi."}
            </p>
          </div>

          {/* Block 1: What Makes a Tyre EV-Ready */}
          <div className="max-w-6xl mx-auto space-y-3 mb-8 text-start">
            <h3 className="text-xs sm:text-sm font-black uppercase text-gray-950 tracking-wide">
              {isAr ? "ما الذي يجعل الإطار \"جاهزاً للسيارات الكهربائية\"؟" : 'WHAT MAKES A TYRE "EV-READY"?'}
            </h3>
            <p className="text-xs sm:text-[12px] text-gray-700 leading-relaxed">
              {isAr
                ? "كل جزء من إطار السيارة الكهربائية مبني مع مراعاة القيادة الكهربائية. إليك ما يعنيه ذلك عملياً خلف عجلة القيادة:"
                : "Every part of an EV tyre is built with electric driving in mind. Here's what that actually means for you behind the wheel:"}
            </p>

            <ul className="space-y-2.5 text-xs sm:text-[12px] text-gray-700 pl-4 rtl:pr-4">
              <li className="list-disc">
                <strong className="text-gray-950 font-bold">{isAr ? "دعم العزم الفوري — " : "Instant Torque Support — "}</strong>
                {isAr
                  ? "أنماط مداس مقواة تتحمل التسارع المفاجئ وقوة الكبح العالية الفريدة للسيارات الكهربائية، مما يمنحك ثباتاً أقوى من أول لحظة تضغط فيها على الدواسة."
                  : "Reinforced tread patterns handle the sudden acceleration and stronger braking force unique to EVs, giving you a firmer grip from the first second you press the pedal."}
              </li>
              <li className="list-disc">
                <strong className="text-gray-950 font-bold">{isAr ? "مركبات مقاومة للحرارة — " : "Heat-Resistant Compounds — "}</strong>
                {isAr
                  ? "مواد مداس خاصة تقاوم تراكم الحرارة على أسفلت أبوظبي الساخن، بحيث يستمر التماسك حتى أثناء القيادة الطويلة وعالية السرعة على طرق مثل شارع الشيخ زايد أو طريق العين."
                  : "Special tread materials resist heat buildup on hot Abu Dhabi asphalt, so traction holds up even during long, high-speed drives on roads like Sheikh Zayed Bin Sultan Street or the Al Ain highway."}
              </li>
              <li className="list-disc">
                <strong className="text-gray-950 font-bold">{isAr ? "مقاومة تدحرج منخفضة — " : "Low Rolling Resistance — "}</strong>
                {isAr
                  ? "صُممت إطارات السيارات الكهربائية لتتدحرج بكفاءة أكبر، مما يساعدك في الحصول على مدى أطول لكل شحنة بطارية."
                  : "EV tyres are engineered to roll more efficiently, helping you get more range out of every charge."}
              </li>
              <li className="list-disc">
                <strong className="text-gray-950 font-bold">{isAr ? "مقصورة فائقة الهدوء — " : "Whisper-Quiet Cabin — "}</strong>
                {isAr
                  ? "طبقات عازلة للصوت وفوم ممتص للضوضاء يقللان من ضجيج الطريق — وهو ما ستلاحظه بشكل أكبر في سيارة كهربائية هادئة."
                  : "Sound-dampening layers and noise-absorbing foam cut down on road noise — which you'll notice a lot more in a near-silent EV."}
              </li>
              <li className="list-disc">
                <strong className="text-gray-950 font-bold">{isAr ? "تصنيف حمولة أعلى — " : "Higher Load Rating — "}</strong>
                {isAr
                  ? "مصنوع لحمل الوزن الإضافي لحزمة بطارية السيارة الكهربائية دون تآكل مبكر للمداس."
                  : "Built to carry the extra weight of an EV's battery pack without breaking down the tread early."}
              </li>
            </ul>

            <p className="text-xs sm:text-[12px] text-gray-600 pt-1">
              {isAr
                ? "تتكامل هذه الميزات معاً لتمنحك تحكماً أكثر ثباتاً، وتآكلاً أقل للإطارات، وركوباً سلساً حتى عندما تقود سيارتك الكهربائية بأقصى أداء."
                : "Together, these features add up to steadier handling, less tyre wear, and a smoother ride even when you're pushing your EV hard."}
            </p>
          </div>

          {/* Block 2: Made for Abu Dhabi Heat */}
          <div className="max-w-6xl mx-auto space-y-2.5 text-start">
            <h3 className="text-xs sm:text-sm font-black uppercase text-gray-950 tracking-wide">
              {isAr ? "مصممة لحرارة أبوظبي، والطرق السريعة، والقيادة اليومية" : "MADE FOR ABU DHABI HEAT, HIGHWAYS, AND EVERYDAY DRIVING"}
            </h3>
            <p className="text-xs sm:text-[12px] text-gray-700 leading-relaxed">
              {isAr
                ? "طرق أبوظبي أقسى على الإطارات من غيرها. فبين حرارة الصيف الشديدة، والرطوبة على طول الساحل والكورنيش، والمسافات الطويلة والسريعة على الطرق السريعة مثل E11 و E10، يتآكل الإطار العادي هنا بشكل أسرع بكثير مما قد يحدث في أماكن أخرى. ولهذا السبب تُصنع إطارات السيارات الكهربائية في تايرز ورلد من مركبات مقاومة للحرارة تقلل من السخونة الزائدة، وتحافظ على التماسك، وتبطئ التآكل الناجم عن المناخ."
                : "Abu Dhabi's roads are tougher on tyres than most. Between extreme summer heat, humidity along the coast and Corniche, and long, fast stretches of highway like the E11 and E10, a standard tyre wears out faster here than it would elsewhere. That's why EV tyres at TyresWorld are made with heat-resistant compounds that reduce overheating, hold their grip, and slow down the wear that Abu Dhabi's climate usually causes."}
            </p>
            <p className="text-xs sm:text-[12px] text-gray-700 leading-relaxed">
              {isAr
                ? "سواء كنت تتنقل يومياً بين مدينة خليفة ووسط المدينة، أو متجهاً إلى جزيرة ياس أو السعديات، أو في رحلة أطول نحو العين، فإن اختيار الإطار المناسب يصنع الفارق. نوفر لك في تايرز ورلد أفضل ماركات إطارات EV المضمونة، مع نصائح الخبراء وخدمات التركيب والموازنة وضبط الزوايا في أي مكان في أبوظبي."
                : "Whether you're commuting between Khalifa City and downtown, driving out to Yas Island or Saadiyat, or taking a longer trip toward Al Ain, having the right tyre matters. At TyresWorld, we stock trusted EV tyre brands, back every purchase with expert advice, and can help with fitting, balancing, and wheel alignment anywhere across Abu Dhabi."}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Top EV Tyre Brands Available in Abu Dhabi (Exact Card Design) ── */}
      <section className="py-12 sm:py-16 bg-[#fbfbfb] border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "أفضل ماركات إطارات السيارات الكهربائية " : "TOP EV TYRE BRANDS "}
              <span className="text-[#ed1c24]">
                {isAr ? "المتوفرة في أبوظبي" : "AVAILABLE IN ABU DHABI"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1.5">
              {isAr
                ? "تكنولوجيا إطارات موثوقة، مصممة لقيادة كهربائية أكثر هدوءاً وذكاءً"
                : "Trusted tyre technology, engineered for quieter, smarter electric driving"}
            </p>
            <p className="text-xs sm:text-[12.5px] text-gray-600 mt-2 max-w-4xl mx-auto leading-relaxed">
              {isAr
                ? "توفر تايرز ورلد إطارات السيارات الكهربائية من كبرى العلامات العالمية الموثوقة — إطارات مصممة للتعامل مع العزم اللحظي، والوزن الإضافي للبطارية، وظروف طرق أبوظبي، دون المساومة على الراحة أو الأمان. إليك تشكيلة مميزة للبدء؛ ويمكن لفريقنا مساعدتك في اختيار الإطار الأنسب لسيارتك وترتيب التركيب في أي مكان."
                : "TyresWorld stocks EV tyres from some of the most trusted names in the industry — brands built for instant torque, added battery weight, and Abu Dhabi's road conditions, without compromising on comfort or safety. Below is a selection to get you started; our team can help you match the right one to your exact vehicle and arrange fitting anywhere in the city."}
            </p>
          </div>

          {/* Subheading: Browse by Brand */}
          <div className="max-w-6xl mx-auto mb-6">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-950 text-start">
              {isAr ? "تصفح الإطارات المتوافقة مع EV حسب الماركة" : "BROWSE EV-COMPATIBLE TYRES BY BRAND"}
            </h3>
          </div>

          {/* 4 Brand Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-8">
            {EV_TYRES.map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Grey Header with Centered Logo & Mesh Background */}
                  <div className="bg-[#f0f2f5] py-4 px-3 text-center border-b border-gray-100 flex items-center justify-center h-12">
                    <img src={t.brandLogo} alt={t.brandName} className="max-h-6 max-w-[120px] object-contain" />
                  </div>

                  {/* Big Angled Tyre Image */}
                  <div className="bg-[#f8f9fa] p-4 flex items-center justify-center h-48 sm:h-52">
                    <img
                      src={t.image}
                      alt={t.title}
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card White Body Content */}
                  <div className="p-4 text-start">
                    <h4 className="text-xs sm:text-[13px] font-black uppercase text-gray-950 tracking-tight leading-snug">
                      {t.title}
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 mb-3.5 leading-snug min-h-[32px]">
                      {t.subtitle}
                    </p>

                    {/* Features checklist with red ticks */}
                    <ul className="space-y-1.5 text-[11px] text-gray-800 font-medium mb-2">
                      {t.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-1.5">
                          <Check size={12} className="text-[#ed1c24] stroke-[3] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Solid Red Shop Button */}
                <Link
                  href={t.link}
                  className="w-full bg-[#d62828] hover:bg-black text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 text-center transition-colors block"
                >
                  {t.buttonLabel}
                </Link>
              </div>
            ))}
          </div>

          {/* Centered Black Pill Button */}
          <div className="text-center">
            <Link
              href={`/${locale}/tyres?ev_tyre=EV`}
              className="inline-block bg-black hover:bg-[#ed1c24] text-white text-xs font-bold px-7 py-2.5 rounded-full transition-colors shadow-xs"
            >
              {isAr ? "تصفح جميع إطارات EV" : "Browse All EV Tyres"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Popular Electric Cars in Abu Dhabi (Matching Card Design) ── */}
      <section className="py-12 sm:py-16 border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "أشهر السيارات الكهربائية " : "POPULAR ELECTRIC CARS "}
              <span className="text-[#ed1c24]">
                {isAr ? "في أبوظبي" : "IN ABU DHABI"}
              </span>
            </h2>
            <p className="text-xs sm:text-[12.5px] text-gray-600 mt-2 max-w-4xl mx-auto leading-relaxed">
              {isAr
                ? "أصبحت السيارات الكهربائية مشهداً مألوفاً في جميع أنحاء أبوظبي، ولكل طراز احتياجاته الخاصة من الإطارات بناءً على الوزن والقوة وأسلوب القيادة. إليك دليلاً سريعاً لأشهر السيارات الكهربائية على طرق أبوظبي والإطارات التي نوصي بها لكل منها:"
                : "Electric vehicles are becoming a familiar sight across Abu Dhabi, and each model has its own tyre needs based on weight, power, and driving style. Here's a quick guide to some of the most popular EVs on Abu Dhabi roads and the tyres we'd recommend for each."}
            </p>
          </div>

          {/* 4 Car Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-8">
            {POPULAR_CARS.map((car) => (
              <div
                key={car.name}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Car Image Area */}
                  <div className="bg-[#f8f9fa] p-4 flex items-center justify-center h-48 sm:h-52 border-b border-gray-100">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 text-start">
                    <h4 className="text-xs sm:text-[13px] font-black uppercase text-gray-950 tracking-tight leading-snug">
                      {car.name}
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 mb-3.5 leading-snug min-h-[32px]">
                      {car.desc}
                    </p>

                    {/* Recommended tyres list with red ticks */}
                    <ul className="space-y-1.5 text-[11px] text-gray-800 font-medium mb-2">
                      {car.recommended.map((rec) => (
                        <li key={rec} className="flex items-center gap-1.5">
                          <Check size={12} className="text-[#ed1c24] stroke-[3] shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Solid Red Explore Button */}
                <Link
                  href={car.link}
                  className="w-full bg-[#d62828] hover:bg-black text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 text-center transition-colors block"
                >
                  {car.buttonLabel}
                </Link>
              </div>
            ))}
          </div>

          {/* Centered Black Pill Button */}
          <div className="text-center">
            <Link
              href={`/${locale}/tyres/cars`}
              className="inline-block bg-black hover:bg-[#ed1c24] text-white text-xs font-bold px-7 py-2.5 rounded-full transition-colors shadow-xs"
            >
              {isAr ? "تصفح جميع موديلات السيارات" : "Browse All Car Models"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Why Choose TyresWorld for Your EV Tyres in Abu Dhabi ── */}
      <section className="py-12 sm:py-16 bg-[#fbfbfb] border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "لماذا تختار تايرز ورلد لإطاراتك الكهربائية " : "WHY CHOOSE TYRESWORLD FOR YOUR EV TYRES "}
              <span className="text-[#ed1c24]">
                {isAr ? "في أبوظبي" : "IN ABU DHABI"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-2">
              {isAr
                ? "إطارات أصلية، وتركيب معتمد، ودعم متواصل يمكنك الاعتماد عليه"
                : "Genuine EV tyres, expert fitting, and support you can rely on"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-[#ed1c24] p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-between">
              <div>
                <div className="h-14 flex items-center justify-center mb-4">
                  <img
                    src="/images/ev/ev-tyres-icon.png"
                    alt="A Full Range of EV Tyres"
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-black uppercase text-gray-950 tracking-wide mb-2.5">
                  {isAr ? "تشكيلة شاملة من إطارات EV" : "A FULL RANGE OF EV TYRES"}
                </h4>
                <p className="text-[11.5px] text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {isAr
                    ? "من الطرازات اليومية إلى السيارات الكهربائية عالية الأداء، نوفر إطارات لجميع السيارات الكهربائية في أبوظبي."
                    : "From daily-commute models to high-performance EVs, we stock tyres for every major electric vehicle on Abu Dhabi's roads."}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-[#ed1c24] p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-between">
              <div>
                <div className="h-14 flex items-center justify-center mb-4">
                  <img
                    src="/images/ev/mobile-van-icon.png"
                    alt="Installation Wherever You Are"
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-black uppercase text-gray-950 tracking-wide mb-2.5">
                  {isAr ? "التركيب أينما كنت" : "INSTALLATION WHEREVER YOU ARE"}
                </h4>
                <p className="text-[11.5px] text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {isAr
                    ? "تصلك خدمة الفان المتنقل في أي مكان في أبوظبي — من مدينة خليفة إلى جزيرة ياس — دون الحاجة للانتظار في الورش."
                    : "Our mobile fitting service comes to you, anywhere in Abu Dhabi — from Khalifa City to Yas Island — so you don't have to work around a workshop's schedule."}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-[#ed1c24] p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-between">
              <div>
                <div className="h-14 flex items-center justify-center mb-4">
                  <img
                    src="/images/ev/tire-installation.png"
                    alt="Fitted by Experienced Technicians"
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-black uppercase text-gray-950 tracking-wide mb-2.5">
                  {isAr ? "تركيب بأيدي فنيين محترفين" : "FITTED BY EXPERIENCED TECHNICIANS"}
                </h4>
                <p className="text-[11.5px] text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {isAr
                    ? "يتم تركيب كل إطار وموازنته وضبط زواياه بدقة فائقة من قبل متخصصين مدربين لضمان أعلى مستويات الأمان."
                    : "Every tyre is fitted, balanced, and aligned by trained specialists, so you get accurate, safe results every time."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Decode Your EV's Tyre Size ── */}
      <section className="py-12 sm:py-16 border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "كيف تقرأ وتحدد " : "DECODE YOUR "}
              <span className="text-[#ed1c24]">
                {isAr ? "مقاس إطار سيارتك الكهربائية" : "EV'S TYRE SIZE"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1.5">
              {isAr
                ? "اختيار المقاس الصحيح بدقة يصنع فارقاً كبيراً في التحكم، والراحة، وكفاءة استهلاك البطارية."
                : "Get the size right and you'll notice the difference in handling, comfort, and efficiency."}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs overflow-hidden">
            <img
              src="/images/ev/tyre-size-guide-chart-new.webp"
              alt="EV Tyre Size Guide"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* ── 8. What to Look for When Choosing EV Tyres (6 Pill-shaped Boxes) ── */}
      <section className="py-12 sm:py-16 bg-[#fbfbfb] border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "ما الذي تبحث عنه " : "WHAT TO LOOK FOR "}
              <span className="text-[#ed1c24]">
                {isAr ? "عند اختيار إطارات EV" : "WHEN CHOOSING EV TYRES"}
              </span>
            </h2>
            <p className="text-xs sm:text-[13px] font-bold text-gray-900 mt-2 max-w-2xl mx-auto">
              {isAr
                ? "يعتمد اختيار الإطار المناسب على عادات قيادتك، والمسافات التي تقطعها، وطبيعة مناخ أبوظبي."
                : "The right tyre comes down to your driving habits, the roads you cover, and Abu Dhabi's climate."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PICK_BOXES.map((box) => (
              <div
                key={box.title}
                className="bg-white rounded-full border border-gray-200/90 shadow-[0_3px_12px_rgba(0,0,0,0.06)] hover:shadow-md transition-all p-3 sm:px-5 flex items-center gap-4"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e8f2fc] flex items-center justify-center p-2.5 shrink-0">
                  <img src={box.icon} alt={box.title} className="w-full h-full object-contain" />
                </div>
                <div className="text-start">
                  <h4 className="text-xs sm:text-[13.5px] font-black text-gray-950 leading-snug">
                    {box.title}
                  </h4>
                  <div className="w-7 h-[2.5px] bg-[#ed1c24] mt-1.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Frequently Asked Questions (Accordion) ── */}
      <section className="py-12 sm:py-16 border-b border-gray-200">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black uppercase text-gray-950 tracking-tight leading-tight">
              {isAr ? "الأسئلة الشائعة " : "FREQUENTLY ASKED QUESTIONS "}
              <span className="text-[#ed1c24]">
                {isAr ? "حول إطارات السيارات الكهربائية في أبوظبي" : "ABOUT EV TYRES IN ABU DHABI"}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-start px-5 py-4 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-[#ed1c24] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#ed1c24]" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-[13px] text-gray-600 leading-relaxed border-t border-gray-50">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
