"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MapPin,
  Search,
  Crosshair,
  ArrowRight,
  ChevronDown,
  Navigation,
  Loader2,
  CheckCircle2,
  Store,
  Truck,
  Package,
} from "lucide-react";
import StoreLocatorMap, { type StoreLocation } from "@/components/StoreLocatorMap";
import { useCart } from "@/lib/cart-context";

// Haversine distance calculator
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function StoreBadgeIcon() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-emerald-300/80 bg-[#f0fbf5] flex items-center justify-center shadow-2xs">
      <img
        src="/img/independent-badge.png"
        alt="Independent Installer"
        className="w-full h-full object-contain p-0.5"
      />
    </div>
  );
}

const DEFAULT_UAE_CITIES = [
  "All",
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dubai",
  "Fujairah",
  "Ras Al-Khaimah",
  "Sharjah",
];

const UAE_CITIES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
];

export default function StoreLocatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafb]" />}>
      <StoreLocatorContent />
    </Suspense>
  );
}

function StoreLocatorContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";
  const isAr = locale === "ar";
  const { cartId, cartToken, refresh } = useCart();

  // API Data State (100% Dynamic from Magento GraphQL / API)
  const [cities, setCities] = useState<string[]>(DEFAULT_UAE_CITIES);
  const [branches, setBranches] = useState<StoreLocation[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Delivery Mode State
  const [deliveryMode, setDeliveryMode] = useState<"install_outlet" | "mobile_van" | "free_shipping">("install_outlet");
  const [mobileAddress, setMobileAddress] = useState("");
  const [mobileCity, setMobileCity] = useState("Dubai");
  const [mobileDate, setMobileDate] = useState("");
  const [mobileTimeSlot, setMobileTimeSlot] = useState("");

  // Interactive UI State
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Accordion Expand States
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  // Booking Form Inputs
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Generate upcoming 10 days for date selector
  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const label =
        i === 0
          ? `Today (${dateStr})`
          : i === 1
          ? `Tomorrow (${dateStr})`
          : d.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
      dates.push({ value: dateStr, label });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (upcomingDates.length > 0) {
      if (!selectedDate) setSelectedDate(upcomingDates[0].value);
      if (!mobileDate) setMobileDate(upcomingDates[0].value);
    }
  }, [upcomingDates, selectedDate, mobileDate]);

  // Fetch all data from API dynamically
  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/store-locator?locale=${locale}`);
        const data = await res.json();
        if (active && data) {
          if (data.cities?.length) setCities(data.cities);
          if (data.branches?.length) {
            setBranches(data.branches);
            setSelectedStoreId(data.branches[0].id);
          }
          if (data.timeSlots?.length) {
            setTimeSlots(data.timeSlots);
            if (!selectedTimeSlot) setSelectedTimeSlot(data.timeSlots[0]);
            if (!mobileTimeSlot) setMobileTimeSlot(data.timeSlots[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load store locator data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [locale]);

  // Handle User Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSelectedCity("All");
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Filtered & Sorted Stores
  const filteredBranches = useMemo(() => {
    const baseCoords = userCoords || { lat: 24.3682674, lng: 54.5124881 };

    let result = branches.map((store) => {
      const distance = calculateDistanceKm(baseCoords.lat, baseCoords.lng, store.lat, store.lng);
      return { ...store, distance };
    });

    if (selectedCity && selectedCity !== "All") {
      result = result.filter(
        (s) =>
          s.city.toLowerCase() === selectedCity.toLowerCase() ||
          s.address.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

    return result;
  }, [branches, selectedCity, searchQuery, userCoords]);

  // Save installer selection to Magento quote & proceed to checkout
  const handleConfirmStoreBooking = async (branch: StoreLocation) => {
    const installData = {
      type: "install_outlet",
      branch: { id: branch.id, name: branch.name, address: branch.address, city: branch.city },
      date: selectedDate || upcomingDates[0]?.value,
      time: selectedTimeSlot || timeSlots[0] || "10:00 AM - 12:00 PM",
    };
    try {
      localStorage.setItem("selected_installation", JSON.stringify(installData));
    } catch {}

    if (cartId) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            op: "setInstallerSelection",
            cartId,
            deliveryMode: "install_at_outlet",
            storeId: branch.id,
            pickupDate: installData.date,
            pickupTime: installData.time,
            token: cartToken || undefined,
          }),
        });
        await refresh();
      } catch (e) {
        console.error("Save installer error:", e);
      }
    }
    router.push(`/${locale}/checkout`);
  };

  const handleConfirmMobileVan = async () => {
    const installData = {
      type: "mobile_van",
      mobileAddress: mobileAddress || "Customer Location",
      city: mobileCity,
      date: mobileDate || upcomingDates[0]?.value,
      time: mobileTimeSlot || timeSlots[0] || "10:00 AM - 12:00 PM",
    };
    try {
      localStorage.setItem("selected_installation", JSON.stringify(installData));
    } catch {}

    if (cartId) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            op: "setInstallerSelection",
            cartId,
            deliveryMode: "mobile_van_service",
            pickupLocation: `${mobileAddress}, ${mobileCity}`,
            pickupDate: installData.date,
            pickupTime: installData.time,
            token: cartToken || undefined,
          }),
        });
        await refresh();
      } catch (e) {
        console.error("Save mobile van error:", e);
      }
    }
    router.push(`/${locale}/checkout`);
  };

  const handleConfirmFreeShipping = async () => {
    const installData = {
      type: "free_shipping",
    };
    try {
      localStorage.setItem("selected_installation", JSON.stringify(installData));
    } catch {}

    if (cartId) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            op: "setInstallerSelection",
            cartId,
            deliveryMode: "free_shipping",
            token: cartToken || undefined,
          }),
        });
        await refresh();
      } catch (e) {
        console.error("Save free shipping error:", e);
      }
    }
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20 text-gray-900 font-sans">
      {/* ── Top Banner: SELECT DELIVERY OPTION ── */}
      <div className="relative bg-black py-9 sm:py-11 text-center">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-wider font-sans">
            SELECT DELIVERY OPTION
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Row: Title & Subtitle + City Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 font-sans">
              TYRE FITTING PARTNERS NEAR YOU
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Enter your area or city to see nearby fitting partners.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {cities.map((city) => {
              const isActive = selectedCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#ed1c24] text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 bg-white border border-gray-300 rounded-lg flex items-center px-3.5 py-2 focus-within:border-black transition-all">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mr-2.5" />
            <input
              type="text"
              placeholder="Enter area or city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-gray-400 hover:text-gray-700 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="bg-black hover:bg-[#ed1c24] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
          >
            <Search size={15} />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            <Crosshair size={15} className={locating ? "animate-spin text-[#ed1c24]" : "text-gray-600"} />
            <span>{locating ? "Locating..." : "Use my location"}</span>
          </button>
        </div>

        {/* 3 Delivery Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Option 1: Install at Outlet */}
          <button
            type="button"
            onClick={() => setDeliveryMode("install_outlet")}
            className={`text-left p-5 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              deliveryMode === "install_outlet"
                ? "border-2 border-[#ed1c24] bg-[#f0f9f6] shadow-xs"
                : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "install_outlet" ? "bg-[#ed1c24] text-white" : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}
            >
              <Store size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Install at Outlet</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Visit our outlet for professional installation</p>
          </button>

          {/* Option 2: Mobile Van Service */}
          <button
            type="button"
            onClick={() => setDeliveryMode("mobile_van")}
            className={`text-left p-5 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              deliveryMode === "mobile_van"
                ? "border-2 border-[#ed1c24] bg-[#f0f9f6] shadow-xs"
                : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "mobile_van" ? "bg-[#ed1c24] text-white" : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}
            >
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Mobile Van Service</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Our mobile van comes to your location</p>
          </button>

          {/* Option 3: Free Shipping */}
          <button
            type="button"
            onClick={() => setDeliveryMode("free_shipping")}
            className={`text-left p-5 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              deliveryMode === "free_shipping"
                ? "border-2 border-[#ed1c24] bg-[#f0f9f6] shadow-xs"
                : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "free_shipping" ? "bg-[#ed1c24] text-white" : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}
            >
              <Package size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Free Shipping</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Delivery without fitment service</p>
          </button>
        </div>

        {/* Active Mode Content */}
        {deliveryMode === "install_outlet" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6 items-start">
            {/* Left: Store Cards List */}
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-gray-500 text-sm">No fitting partners found for this search or city.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("All");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs font-bold text-[#ed1c24] hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredBranches.map((branch) => {
                  const isSelected = selectedStoreId === branch.id;
                  const isExpanded = expandedStoreId === branch.id;

                  return (
                    <div
                      key={branch.id}
                      className={`relative bg-white rounded-xl border transition-all ${
                        isSelected
                          ? "border-gray-300 shadow-xs border-l-4 border-l-[#ed1c24]"
                          : "border-gray-200/90 hover:border-gray-300"
                      } p-4 sm:p-5`}
                    >
                      <div className="flex items-start gap-3.5">
                        <StoreBadgeIcon />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-950 uppercase tracking-tight line-clamp-1">
                            {branch.name}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-start gap-1 mt-1 leading-snug">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>{branch.address}</span>
                          </p>
                          {branch.distance !== undefined && (
                            <p className="text-xs font-bold text-gray-800 mt-1.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ed1c24]" />
                              <span>{branch.distance.toFixed(2)} kilometer</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                          {branch.whatsapp && (
                            <a
                              href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                            >
                              <WhatsAppIcon />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 hover:text-[#ed1c24] transition-colors"
                          >
                            <Navigation size={13} className="text-gray-400" />
                            <span>Directions</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedStoreId(branch.id)}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer text-gray-500"
                          >
                            <span>See on Map</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStoreId(branch.id);
                            setExpandedStoreId(isExpanded ? null : branch.id);
                          }}
                          className="bg-[#ed1c24] hover:bg-[#c6181d] active:bg-[#aa1217] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                          <span>Book Installer</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      {/* Expandable Booking Form Drawer */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 bg-[#f9fafb] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl animate-in fade-in duration-200">
                          <p className="text-xs font-extrabold uppercase text-gray-900 mb-3 tracking-wider">
                            Select Fitting Date & Time Slot
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">Preferred Date</label>
                              <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black"
                              >
                                {upcomingDates.map((d) => (
                                  <option key={d.value} value={d.value}>
                                    {d.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">Time Slot</label>
                              <select
                                value={selectedTimeSlot}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black"
                              >
                                {(timeSlots.length > 0
                                  ? timeSlots
                                  : [
                                      "09:00 AM - 11:00 AM",
                                      "11:00 AM - 01:00 PM",
                                      "02:00 PM - 04:00 PM",
                                      "04:00 PM - 06:00 PM",
                                      "06:00 PM - 08:00 PM",
                                    ]
                                ).map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleConfirmStoreBooking(branch)}
                            className="w-full bg-black hover:bg-[#ed1c24] text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Confirm & Proceed to Checkout</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Map */}
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs h-[600px]">
              <StoreLocatorMap
                stores={filteredBranches}
                selectedStoreId={selectedStoreId}
                onSelectStore={(store: StoreLocation) => {
                  setSelectedStoreId(store.id);
                  setExpandedStoreId(store.id);
                }}
              />
            </div>
          </div>
        )}

        {deliveryMode === "mobile_van" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#ed1c24] flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Mobile Van Service</h3>
                <p className="text-xs text-gray-500">
                  Our certified mobile tyre fitting van will come to your home, office, or anywhere in the UAE.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Fitting Location / Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Building, street, community or area"
                  value={mobileAddress}
                  onChange={(e) => setMobileAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mobileCity}
                    onChange={(e) => setMobileCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                  >
                    {UAE_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mobileDate}
                    onChange={(e) => setMobileDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                  >
                    {upcomingDates.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={mobileTimeSlot}
                  onChange={(e) => setMobileTimeSlot(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                >
                  {(timeSlots.length > 0
                    ? timeSlots
                    : [
                        "09:00 AM - 11:00 AM",
                        "11:00 AM - 01:00 PM",
                        "02:00 PM - 04:00 PM",
                        "04:00 PM - 06:00 PM",
                        "06:00 PM - 08:00 PM",
                      ]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmMobileVan}
              className="w-full bg-black hover:bg-[#ed1c24] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Confirm Mobile Van & Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {deliveryMode === "free_shipping" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#ed1c24] flex items-center justify-center mx-auto mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase mb-2">Free Courier Shipping</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Your tyres will be delivered directly to your doorstep anywhere in the UAE without fitment service.
            </p>

            <button
              type="button"
              onClick={handleConfirmFreeShipping}
              className="w-full bg-black hover:bg-[#ed1c24] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Proceed to Shipping Address & Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
