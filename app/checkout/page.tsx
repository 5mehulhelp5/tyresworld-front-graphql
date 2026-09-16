"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, CheckCircle, ShoppingBag, Loader2,
  Truck, CreditCard, FileText,
  User, Car, ChevronDown, ChevronUp, ShieldCheck, Sparkles,
  MapPin, Search, Crosshair, Navigation, CheckCircle2, Check, Store, Package
} from "lucide-react";
import StoreLocatorMap, { type StoreLocation } from "@/components/StoreLocatorMap";
import { APP_CONFIG } from "@/src/config/app-config";
import { useCart } from "@/lib/cart-context";
import type { ShippingMethodOption } from "@/lib/types";
import { Money } from "@/components/Price";

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

type Agreement = { agreement_id: number; checkbox_text: string; content: string; is_html: boolean; name: string };

/* ─── API helpers ────────────────────────────────────────────────── */
async function api(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { error: `Server error (HTTP ${res.status}). Please retry.` }; }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error." };
  }
}

async function ordersApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { error: `Server error (HTTP ${res.status}). Please retry.` }; }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error." };
  }
}

const EMPTY_FORM = {
  email: "",
  firstname: "",
  lastname: "",
  company: "",
  street: "",
  city: "Dubai",
  region: "",
  postcode: "00000",
  telephone: "",
  country_code: "AE",
};

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

/* ─── Main page ──────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const { cartId, cartToken, items, count, subtotal, grandTotal, currency, cart, ready, applyCoupon, removeCoupon, clearLocal, refresh } = useCart();

  const [form,            setForm]            = useState({ ...EMPTY_FORM });
  const [sameAsShipping,  setSameAsShipping]  = useState(true);
  const [, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [paymentMethods,  setPaymentMethods]  = useState<{ code: string; title: string }[]>([]);
  const [selShipping,     setSelShipping]     = useState("");
  const [selPayment,      setSelPayment]      = useState("");
  const [busy,            setBusy]            = useState(false);
  const [,  setLoadingMethods]  = useState(false);
  const [error,           setError]           = useState("");
  const [orderNumber,     setOrderNumber]     = useState<string | null>(null);
  const [agreements,      setAgreements]      = useState<Agreement[]>([]);
  const [agreedIds,       setAgreedIds]       = useState<Set<number>>(new Set());
  const [showAgreement,   setShowAgreement]   = useState<Agreement | null>(null);
  const [step,            setStep]            = useState<"delivery" | "checkout" | "done">("delivery");
  const [orderV2,         setOrderV2]         = useState<Record<string, unknown> | null>(null);

  // Delivery step state
  const [deliveryMode,    setDeliveryMode]    = useState<"install_outlet" | "mobile_van" | "free_shipping">("install_outlet");
  const [cities,          setCities]          = useState<string[]>(DEFAULT_UAE_CITIES);
  const [branches,        setBranches]        = useState<StoreLocation[]>([]);
  const [timeSlots,       setTimeSlots]       = useState<string[]>([]);
  const [selectedCity,    setSelectedCity]    = useState<string>("All");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [userCoords,      setUserCoords]      = useState<{ lat: number; lng: number } | null>(null);
  const [locating,        setLocating]        = useState(false);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [selectedDate,    setSelectedDate]    = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [mobileAddress,   setMobileAddress]   = useState("");
  const [mobileCity,      setMobileCity]      = useState("Dubai");
  const [mobileDate,      setMobileDate]      = useState("");
  const [mobileTimeSlot,  setMobileTimeSlot]  = useState("");

  // Accordion and sub-form states
  const [isItemsListOpen, setIsItemsListOpen] = useState(true);
  const [isCouponOpen,    setIsCouponOpen]    = useState(false);
  const [isCommentsOpen,  setIsCommentsOpen]  = useState(false);
  const [couponInput,     setCouponInput]     = useState("");
  const [couponError,     setCouponError]     = useState("");
  const [couponSuccess,   setCouponSuccess]   = useState(false);
  const [orderComments,   setOrderComments]   = useState("");

  // Vehicle states
  const [vehiclePlate,   setVehiclePlate]    = useState("");
  const [selectedMake,   setSelectedMake]    = useState("");
  const [selectedModel,  setSelectedModel]   = useState("");
  const [selectedYear,   setSelectedYear]    = useState("");
  const [makes,          setMakes]           = useState<{ label: string; value: string }[]>([]);
  const [models,         setModels]          = useState<{ label: string; value: string }[]>([]);
  const [years,          setYears]           = useState<{ label: string; value: string }[]>([]);

  const [installation,   setInstallation]    = useState<{
    type?: string;
    branch?: { id?: string; name?: string; address?: string; city?: string };
    mobileAddress?: string;
    date?: string;
    time?: string;
  } | null>(null);
  const [installerSaveState, setInstallerSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load initial store locator data, vehicles, and agreements
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selected_installation");
      if (saved) {
        const parsed = JSON.parse(saved);
        setInstallation(parsed);
        if (parsed.type === "mobile_van") {
          setDeliveryMode("mobile_van");
          if (parsed.mobileAddress) setMobileAddress(parsed.mobileAddress);
          if (parsed.date) setMobileDate(parsed.date);
          if (parsed.time) setMobileTimeSlot(parsed.time);
        } else if (parsed.type === "free_shipping") {
          setDeliveryMode("free_shipping");
        } else if (parsed.type === "install_outlet") {
          setDeliveryMode("install_outlet");
          if (parsed.branch?.id) {
            setSelectedStoreId(parsed.branch.id);
            setExpandedStoreId(parsed.branch.id);
          }
          if (parsed.date) setSelectedDate(parsed.date);
          if (parsed.time) setSelectedTimeSlot(parsed.time);
        }
      }
    } catch (e) {
      console.error(e);
    }

    fetch(`/api/store-locator?locale=${locale}`)
      .then(r => r.json())
      .then(d => {
        if (d.cities?.length) setCities(d.cities);
        if (d.branches?.length) {
          setBranches(d.branches);
          if (!selectedStoreId) setSelectedStoreId(d.branches[0].id);
        }
        if (d.timeSlots?.length) {
          setTimeSlots(d.timeSlots);
          if (!selectedTimeSlot) setSelectedTimeSlot(d.timeSlots[0]);
          if (!mobileTimeSlot) setMobileTimeSlot(d.timeSlots[0]);
        }
      })
      .catch(() => {});

    fetch("/api/checkout")
      .then(r => r.json())
      .then(d => { if (d.agreements?.length) setAgreements(d.agreements as Agreement[]); })
      .catch(() => {});

    fetch("/api/vehicles")
      .then(res => res.json())
      .then(data => setMakes(data.makes ?? []))
      .catch(() => {});
  }, []);

  // Upcoming dates for slot booking
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

  // Handle Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied/error:", err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filtered branches
  const filteredBranches = useMemo(() => {
    const baseCoords = userCoords || { lat: 24.3682674, lng: 54.5124881 };

    return branches
      .filter((b) => {
        const matchesCity =
          selectedCity === "All" ||
          b.city.toLowerCase() === selectedCity.toLowerCase() ||
          (b.city.toLowerCase().includes(selectedCity.toLowerCase()));
        const matchesSearch =
          searchQuery === "" ||
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.city.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCity && matchesSearch;
      })
      .map((b) => {
        const distance = calculateDistanceKm(baseCoords.lat, baseCoords.lng, b.lat, b.lng);
        return { ...b, distance };
      })
      .sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [branches, selectedCity, searchQuery, userCoords]);

  // Selected branch object
  const activeBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedStoreId) || branches[0] || null;
  }, [branches, selectedStoreId]);

  // Confirm Delivery Choice & Proceed to Step 2
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
    setInstallation(installData);

    if (cartId) {
      await api({
        op: "setInstallerSelection",
        cartId,
        deliveryMode: "install_at_outlet",
        storeId: branch.id,
        pickupDate: installData.date,
        pickupTime: installData.time,
        token: cartToken || undefined,
      });
      await refresh();
    }
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setInstallation(installData);

    if (cartId) {
      await api({
        op: "setInstallerSelection",
        cartId,
        deliveryMode: "mobile_van_service",
        pickupLocation: `${mobileAddress}, ${mobileCity}`,
        pickupDate: installData.date,
        pickupTime: installData.time,
        token: cartToken || undefined,
      });
      await refresh();
    }
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmFreeShipping = async () => {
    const installData = {
      type: "free_shipping",
    };
    try {
      localStorage.setItem("selected_installation", JSON.stringify(installData));
    } catch {}
    setInstallation(installData);

    if (cartId) {
      await api({
        op: "setInstallerSelection",
        cartId,
        deliveryMode: "free_shipping",
        token: cartToken || undefined,
      });
      await refresh();
    }
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("selected_installation");
      if (saved) setInstallation(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }

    fetch("/api/checkout")
      .then(r => r.json())
      .then(d => { if (d.agreements?.length) setAgreements(d.agreements as Agreement[]); })
      .catch(() => {});
    fetch("/api/vehicles")
      .then(res => res.json())
      .then(data => setMakes(data.makes ?? []))
      .catch(() => {});
  }, []);

  /* Persist the installer/fitting choice made on the Store Locator page
     onto the real Magento quote — this used to only ever live in
     localStorage and never reach the backend, so a placed order's
     delivery_mode/pickup_store/pickup_date were silently lost. Runs once,
     as soon as both the cart and a saved selection exist; mirrors the
     live storelocator/ajax/saveinstaller controller (also sets the
     matching shipping method server-side), so refresh the cart afterward
     to pick up the real shipping amount / grand total. */
  useEffect(() => {
    if (!cartId || !installation || installerSaveState !== "idle") return;

    const deliveryMode =
      installation.type === "install_outlet" ? "install_at_outlet"
      : installation.type === "mobile_van" ? "mobile_van_service"
      : installation.type;
    if (!deliveryMode) return;

    setInstallerSaveState("saving");
    (async () => {
      const res = await api({
        op: "setInstallerSelection",
        cartId,
        deliveryMode,
        storeId: installation.branch?.id,
        pickupLocation: installation.mobileAddress,
        pickupDate: installation.date,
        pickupTime: installation.time,
        token: cartToken || undefined,
      });
      if (res.error) {
        console.error("Failed to save installer selection:", res.error);
        setInstallerSaveState("error");
      } else {
        setInstallerSaveState("saved");
        await refresh();
      }
    })();
  }, [cartId, installation, installerSaveState, cartToken, refresh]);

  const handleMakeChange = async (make: string) => {
    setSelectedMake(make);
    setSelectedModel("");
    setSelectedYear("");
    setModels([]);
    setYears([]);
    if (!make) return;
    try {
      const res = await fetch(`/api/vehicles?make=${encodeURIComponent(make)}`);
      const data = await res.json();
      setModels(data.models ?? []);
    } catch {}
  };

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    setSelectedYear("");
    setYears([]);
    if (!model) return;
    try {
      const res = await fetch(`/api/vehicles?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(model)}`);
      const data = await res.json();
      setYears(data.years ?? []);
    } catch {}
  };

  const allAgreed = agreements.length === 0 || agreements.every(a => agreedIds.has(a.agreement_id));

  const discounts      = cart?.prices?.discounts ?? [];
  const discountAmount = discounts.reduce((s, d) => s + Math.abs(d.amount.value), 0);
  const appliedTaxes   = cart?.prices?.applied_taxes ?? [];
  const calculatedVat  = appliedTaxes.length > 0 
    ? appliedTaxes.reduce((s, t) => s + t.amount.value, 0)
    : Math.round(subtotal * 0.05 * 100) / 100;
  const tok            = cartToken || undefined;

  const appliedCoupon = cart?.applied_coupons?.[0]?.code;

  const money = (v: number) => <Money value={v} currency={currency || "AED"} digits={2} />;

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function buildAddress() {
    return {
      firstname:    form.firstname || "Guest",
      lastname:     form.lastname || "User",
      company:      form.company || undefined,
      street:       [form.street || "Street address"],
      city:         form.city || "Dubai",
      postcode:     form.postcode || "00000",
      country_code: form.country_code || "AE",
      telephone:    form.telephone || "0500000000",
      region:       form.region || undefined,
    };
  }

  // Background fetch of shipping and payment methods when the address form has sufficient info
  useEffect(() => {
    if (!cartId) return;
    const isValidEmail = form.email && form.email.includes("@") && form.email.includes(".");
    const isAddressValid = form.firstname && form.lastname && form.street && form.city && form.telephone && isValidEmail;

    if (!isAddressValid) return;

    let active = true;
    const debouncer = setTimeout(async () => {
      setLoadingMethods(true);
      try {
        await api({ op: "setEmail", cartId, email: form.email, token: tok });
        if (!active) return;

        const shipRes = await api({ op: "setShippingAddress", cartId, address: buildAddress(), token: tok });
        if (!active) return;
        if (shipRes.error || !shipRes.cart) {
          console.error(shipRes.error);
          return;
        }

        const addr     = (shipRes.cart as Record<string, unknown>).shipping_addresses as { available_shipping_methods?: ShippingMethodOption[] }[] | undefined;
        const methods  = (addr?.[0]?.available_shipping_methods ?? []).filter((m) => m.available);
        const payments = ((shipRes.cart as Record<string, unknown>).available_payment_methods as { code: string; title: string }[]) ?? [];

        setShippingMethods(methods);
        setPaymentMethods(payments);

        // Auto select first shipping method if not selected
        if (methods.length > 0 && !selShipping) {
          setSelShipping(`${methods[0].carrier_code}|${methods[0].method_code}`);
        }
        // Auto-select the first real payment method if none selected yet,
        // or if a previously-selected code is no longer offered.
        if (payments.length > 0 && !payments.some((p) => p.code === selPayment)) {
          setSelPayment(payments[0].code);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingMethods(false);
      }
    }, 1000);

    return () => {
      active = false;
      clearTimeout(debouncer);
    };
  }, [form.email, form.firstname, form.lastname, form.street, form.city, form.telephone, form.country_code, form.region, form.company, cartId, tok]);

  // Handle manual Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setCouponError("");
    setCouponSuccess(false);
    try {
      const err = await applyCoupon(couponInput);
      if (err) {
        setCouponError(err);
      } else {
        setCouponSuccess(true);
        setCouponInput("");
      }
    } catch {
      setCouponError("Could not apply the coupon code.");
    }
  };

  // Handle manual Remove Coupon
  const handleRemoveCoupon = async () => {
    setCouponError("");
    setCouponSuccess(false);
    try {
      await removeCoupon();
    } catch {
      setCouponError("Could not remove the coupon code.");
    }
  };

  // selPayment already holds a real Magento payment method code (set from
  // the live paymentMethods list) — no guessing needed.
  const getSelectedPaymentCode = () => selPayment || paymentMethods[0]?.code || "";

  // Complete Checkout Placement
  async function handlePlaceOrder() {
    if (!cartId) return;

    if (!form.email || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!form.firstname || !form.lastname) {
      setError("Please enter your first and last name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!form.street || !form.city) {
      setError("Please enter your street address and city.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!form.telephone) {
      setError("Please enter your phone number.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!allAgreed) {
      setError("Please accept the terms and conditions.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setBusy(true);
    setError("");

    try {
      // 1. Set guest email
      const emailRes = await api({ op: "setEmail", cartId, email: form.email, token: tok });
      if (emailRes.error) throw new Error(String(emailRes.error));

      // 2. Set shipping address
      const shipRes = await api({ op: "setShippingAddress", cartId, address: buildAddress(), token: tok });
      if (shipRes.error) throw new Error(String(shipRes.error));

      // 3. Set shipping method
      let finalShipping = selShipping;
      if (!finalShipping) {
        const addr = (shipRes.cart as Record<string, unknown>)?.shipping_addresses as { available_shipping_methods?: ShippingMethodOption[] }[] | undefined;
        const methods = (addr?.[0]?.available_shipping_methods ?? []).filter((m) => m.available);
        if (methods.length > 0) {
          finalShipping = `${methods[0].carrier_code}|${methods[0].method_code}`;
        }
      }

      if (finalShipping) {
        const [carrier, method] = finalShipping.split("|");
        const smRes = await api({ op: "setShippingMethod", cartId, carrier, method, token: tok });
        if (smRes.error) throw new Error(String(smRes.error));
      }

      // 4. Set billing address
      const blRes = await api({
        op: "setBilling",
        cartId,
        sameAsShipping,
        address: buildAddress(),
        token: tok,
      });
      if (blRes.error) throw new Error(String(blRes.error));

      // 5. Set payment method
      const finalPaymentCode = getSelectedPaymentCode();
      const pmRes = await api({ op: "setPayment", cartId, code: finalPaymentCode, token: tok });
      if (pmRes.error) throw new Error(String(pmRes.error));

      // 6. Place order
      const ordRes = await api({ op: "placeOrder", cartId, token: tok });
      if (ordRes.error || !ordRes.orderNumber) throw new Error(String(ordRes.error) || "Order could not be placed.");

      const placedOrderNumber = String(ordRes.orderNumber);

      try {
        const completeRes = await ordersApi({
          op:     "completeOrder",
          cartId,
          id:     placedOrderNumber,
          token:  tok,
        });
        if (completeRes.order && !completeRes.error) {
          setOrderV2(completeRes.order as Record<string, unknown>);
        }
      } catch {
        // best-effort
      }

      setOrderNumber(placedOrderNumber);
      setStep("done");
      clearLocal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place the order. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  /* ── Loading ─────────────────────────────────────────────────── */
  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            <div className="h-44 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Empty cart ──────────────────────────────────────────────── */
  if (!cartId || items.length === 0) {
    return (
      <div className="container py-28 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-400 text-sm mb-8">Add products to your cart before checking out.</p>
        <Link href="/" className="inline-block bg-black hover:bg-[#ed1c24] text-white font-black text-xs uppercase tracking-wider py-4 px-8 rounded-sm transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  /* ── Order placed ────────────────────────────────────────────── */
  if (step === "done" && orderNumber) {
    const v2Status   = orderV2?.status as string | undefined;
    const v2Email    = orderV2?.email  as string | undefined;
    const v2Total    = (orderV2?.total as { grand_total?: { value: number; currency: string } } | undefined)?.grand_total;
    return (
      <>
        <div className="bg-black py-12 text-center">
          <div className="container">
            <h1 className="text-3xl font-black uppercase tracking-wider text-white">ORDER CONFIRMED</h1>
          </div>
        </div>
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 text-sm mb-4">Your order has been received and is being processed.</p>
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-sm px-6 py-4 mb-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1">Order Number</p>
            <p className="text-xl font-black text-gray-900 font-mono">{orderNumber}</p>
          </div>
          {(v2Status || v2Email || v2Total) && (
            <div className="flex flex-col gap-1.5 mb-6 text-sm text-gray-500">
              {v2Status && (
                <p>Status: <span className="font-bold text-gray-800 capitalize">{v2Status.toLowerCase().replace(/_/g, " ")}</span></p>
              )}
              {v2Total && (
                <p>Total: <span className="font-bold text-gray-800"><Money value={v2Total.value} currency={v2Total.currency} digits={2} /></span></p>
              )}
              {v2Email && (
                <p>Confirmation sent to: <span className="font-bold text-gray-800">{v2Email}</span></p>
              )}
            </div>
          )}
          <Link href="/" className="inline-flex items-center gap-2 bg-black hover:bg-[#ed1c24] text-white font-black text-xs uppercase tracking-wider py-4 px-8 rounded-sm transition-colors">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </>
    );
  }

  /* ── Delivery selection step ────────────────────────────────── */
  if (step === "delivery") {
    return (
      <div className="bg-[#f9fafb] min-h-screen pb-20 text-gray-900 font-sans">
        {/* Banner */}
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "install_outlet"
                  ? "bg-[#ed1c24] text-white"
                  : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "mobile_van"
                  ? "bg-[#ed1c24] text-white"
                  : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                deliveryMode === "free_shipping"
                  ? "bg-[#ed1c24] text-white"
                  : "bg-[#e8f6f0] text-[#ed1c24]"
              }`}>
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
                {filteredBranches.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-gray-500 text-sm">No fitting partners found for this search or city.</p>
                    <button
                      type="button"
                      onClick={() => { setSelectedCity("All"); setSearchQuery(""); }}
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
                                <span>{branch.distance} kilometer</span>
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
                                    <option key={d.value} value={d.value}>{d.label}</option>
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
                                  {(timeSlots.length > 0 ? timeSlots : ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]).map((t) => (
                                    <option key={t} value={t}>{t}</option>
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
                  <p className="text-xs text-gray-500">Our certified mobile tyre fitting van will come to your home, office, or anywhere in the UAE.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Fitting Location / Address <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                    <select
                      value={mobileCity}
                      onChange={(e) => setMobileCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                    >
                      {UAE_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Preferred Date <span className="text-red-500">*</span></label>
                    <select
                      value={mobileDate}
                      onChange={(e) => setMobileDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                    >
                      {upcomingDates.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Time Slot <span className="text-red-500">*</span></label>
                  <select
                    value={mobileTimeSlot}
                    onChange={(e) => setMobileTimeSlot(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black bg-white"
                  >
                    {(timeSlots.length > 0 ? timeSlots : ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]).map((t) => (
                      <option key={t} value={t}>{t}</option>
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

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20 text-gray-900 font-sans">
      {/* Top Banner with tyre tread background */}
      <div
        className="relative bg-black py-10 sm:py-12 text-center"
        style={{
          backgroundImage: "url('/img/shopping-cart-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase font-sans">
            CHECKOUT
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3 font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Selected Delivery summary & change option button */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ed1c24] flex items-center justify-center shrink-0">
              {deliveryMode === "install_outlet" ? <Store size={20} /> : deliveryMode === "mobile_van" ? <Truck size={20} /> : <Package size={20} />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Selected Delivery Option</p>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                {deliveryMode === "install_outlet" ? `Install at Outlet: ${installation?.branch?.name || activeBranch?.name || "Selected Partner Branch"}`
                 : deliveryMode === "mobile_van" ? `Mobile Van Service: ${installation?.mobileAddress || mobileAddress || "Your Location"}`
                 : "Free Courier Shipping"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("delivery");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-xs font-bold text-[#ed1c24] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            ← Change Delivery Option
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          
          {/* ════════════════ LEFT COLUMN: FORMS ════════════════ */}
          <div className="space-y-6">
            
            {/* 1. ACCOUNT INFORMATION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-gray-200/80 flex items-center gap-2.5">
                <User className="w-4 h-4 text-gray-600" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">ACCOUNT INFORMATION</h2>
              </div>

              <div className="p-5 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={set("email")}
                    className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    You can create an account after checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. BILLING ADDRESS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-gray-200/80 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-600" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">BILLING ADDRESS</h2>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstname}
                      onChange={set("firstname")}
                      className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.lastname}
                      onChange={set("lastname")}
                      className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set("company")}
                      className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.street}
                      onChange={set("street")}
                      className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={form.telephone}
                      onChange={set("telephone")}
                      className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.city}
                        onChange={set("city")}
                        className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all appearance-none pr-9 cursor-pointer bg-white"
                      >
                        <option value="">Select City</option>
                        {UAE_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={e => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 accent-black cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      This address is also my shipping address
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. VEHICLE INFORMATION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-gray-200/80 flex items-center gap-2.5">
                <Car className="w-4 h-4 text-gray-600" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">VEHICLE INFORMATION</h2>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Vehicle Plate
                  </label>
                  <input
                    type="text"
                    placeholder="Enter vehicle plate"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="w-full sm:max-w-xs border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Make</label>
                    <div className="relative">
                      <select
                        value={selectedMake}
                        onChange={e => handleMakeChange(e.target.value)}
                        className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all appearance-none pr-9 cursor-pointer bg-white"
                      >
                        <option value="">Select Make</option>
                        {makes.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={e => handleModelChange(e.target.value)}
                        disabled={!selectedMake}
                        className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all appearance-none pr-9 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer bg-white"
                      >
                        <option value="">Select Model</option>
                        {models.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Year</label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        disabled={!selectedModel}
                        className="w-full border border-gray-300/90 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all appearance-none pr-9 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer bg-white"
                      >
                        <option value="">Select Year</option>
                        {years.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. SHIPPING METHODS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-gray-200/80 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-gray-600" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">SHIPPING METHODS</h2>
              </div>

              <div className="p-5">
                <div className="border-2 border-emerald-500 bg-emerald-50/60 rounded-xl p-4.5 text-center">
                  <div className="font-extrabold text-xs tracking-wider text-emerald-950 uppercase">
                    SELECTED INSTALLER
                  </div>
                  <div className="text-xs text-emerald-800 mt-1.5 font-medium">
                    {installation?.type === "install_outlet" ? (
                      <>Installer: <span className="font-bold text-gray-900">{installation.branch?.name}</span> ({installation.date} {installation.time})</>
                    ) : installation?.type === "mobile_van" ? (
                      <>Mobile Van: <span className="font-bold text-gray-900">{installation.mobileAddress || "Doorstep Service"}</span> ({installation.date} {installation.time})</>
                    ) : (
                      <>Mode: Delivery – Without Fitment</>
                    )}
                  </div>
                  {installation && (
                    <div className="text-[11px] mt-1.5">
                      {installerSaveState === "saving" && (
                        <span className="text-emerald-700">Saving your fitting selection…</span>
                      )}
                      {installerSaveState === "saved" && (
                        <span className="text-emerald-700">✓ Saved to your order</span>
                      )}
                      {installerSaveState === "error" && (
                        <span className="text-red-600">
                          Couldn&apos;t save this selection to your order. Please re-select at{" "}
                          <Link href="/storelocator" className="underline font-semibold">Installer Network</Link>, or place your order and contact us to confirm fitting.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. PAYMENT METHOD */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-gray-200/80 flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">PAYMENT METHOD</h2>
              </div>

              <div className="p-5 space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Enter your delivery address above to see available payment methods.
                  </p>
                ) : (
                  paymentMethods.map((pm) => {
                    const code = pm.code.toLowerCase();
                    const isTabby = code.includes("tabby");
                    const isTamara = code.includes("tamara");

                    return (
                      <div key={pm.code} className={isTabby ? "space-y-3" : undefined}>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={selPayment === pm.code}
                            onChange={() => setSelPayment(pm.code)}
                            className="w-4 h-4 text-red-600 focus:ring-0 accent-red-600 cursor-pointer"
                          />
                          {isTabby && (
                            <span className="inline-flex items-center justify-center bg-[#29e798] text-black font-black text-[10px] px-2 py-0.5 rounded-full mr-1">
                              tabby
                            </span>
                          )}
                          {isTamara && (
                            <span
                              className="inline-flex items-center justify-center text-white font-black text-[10px] px-2 py-0.5 rounded mr-1 shadow-2xs"
                              style={{ background: "linear-gradient(135deg, #b975f5 0%, #fa7c5c 100%)" }}
                            >
                              tamara
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {pm.title}
                          </span>
                        </label>

                        {isTabby && (
                          <div className="ml-6.5 border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <div className="inline-flex items-center justify-center bg-[#29e798] text-black font-black text-[10px] px-2 py-0.5 rounded-full mb-1">
                                tabby
                              </div>
                              <div className="text-xs font-bold text-gray-900">
                                Split your purchase
                              </div>
                              <div className="text-[11px] text-gray-500">
                                into monthly payments
                              </div>
                              <button
                                type="button"
                                className="mt-2 text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg transition-colors shadow-2xs"
                              >
                                View options
                              </button>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-gray-600 font-medium">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>No processing fees</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Use any card</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Buyer protection</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            {agreements.length > 0 && (
              <div className="flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
                {agreements.map(a => (
                  <label key={a.agreement_id} className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedIds.has(a.agreement_id)}
                      onChange={e => {
                        setAgreedIds(prev => {
                          const next = new Set(prev);
                          e.target.checked ? next.add(a.agreement_id) : next.delete(a.agreement_id);
                          return next;
                        });
                      }}
                      className="mt-0.5 accent-black w-4 h-4 rounded"
                    />
                    <span className="text-xs text-gray-600 font-medium leading-relaxed">
                      {a.checkbox_text}{" "}
                      <button
                        type="button"
                        onClick={() => setShowAgreement(a)}
                        className="text-red-600 underline font-bold"
                      >
                        Read terms
                      </button>
                    </span>
                  </label>
                ))}
              </div>
            )}

          </div>

          {/* ════════════════ RIGHT COLUMN: ORDER SUMMARY ════════════════ */}
          <div className="lg:sticky lg:top-8 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
              
              {/* Order summary header */}
              <div className="px-5 py-3.5 bg-[#f0f2f5] border-b border-gray-200/80 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-900">ORDER SUMMARY</h2>
              </div>

              {/* Items in Cart Accordion */}
              <div className="bg-white">
                <button
                  type="button"
                  onClick={() => setIsItemsListOpen(!isItemsListOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-gray-800 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span>{count} Items in Cart</span>
                  {isItemsListOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {isItemsListOpen && (
                  <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto px-5 py-2">
                    {items.map((it) => (
                      <div key={it.uid} className="flex items-center gap-3 py-3">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.product.thumbnail?.url ?? ""}
                            alt={it.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                            {it.product.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-black text-red-600">
                            {money(it.prices.row_total.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white px-5 py-4 border-t border-gray-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-gray-900">{money(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Additional Charge</span>
                  <span className="font-bold text-gray-900">{money(0)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Discount</span>
                    <span>− {money(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700 font-medium">
                  <span>VAT (5%)</span>
                  <span className="font-bold text-gray-900">{money(calculatedVat)}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-3">
                  <span>Order Total</span>
                  <span className="font-black text-gray-900">{money(grandTotal || (subtotal + calculatedVat))}</span>
                </div>
              </div>

            </div>

            {/* Accordion 1: Use Coupon Code */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCouponOpen(!isCouponOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span>Use Coupon Code</span>
                {isCouponOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </button>

              {isCouponOpen && (
                <div className="p-4 bg-gray-50/60 border-t border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-[11px] text-gray-500 font-medium">Applied Code</p>
                        <p className="text-xs font-bold text-emerald-800">{appliedCoupon}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[11px] text-red-600 font-medium mt-1.5">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium mt-1.5">Coupon applied!</p>}
                </div>
              )}
            </div>

            {/* Accordion 2: Comments */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span>Do you have any comments regarding the order?</span>
                {isCommentsOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </button>

              {isCommentsOpen && (
                <div className="p-4 bg-gray-50/60 border-t border-gray-100">
                  <textarea
                    rows={3}
                    placeholder="Enter notes or special requests..."
                    value={orderComments}
                    onChange={e => setOrderComments(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 outline-none focus:border-black resize-none bg-white"
                  />
                </div>
              )}
            </div>

            {/* PLACE ORDER Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={busy || items.length === 0}
              className="w-full bg-black hover:bg-red-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing Order…
                </>
              ) : (
                "PLACE ORDER"
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800">{showAgreement.name}</h3>
              <button onClick={() => setShowAgreement(null)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed">
              {showAgreement.is_html
                ? <div dangerouslySetInnerHTML={{ __html: showAgreement.content }} />
                : <p className="whitespace-pre-wrap">{showAgreement.content}</p>
              }
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setAgreedIds(prev => new Set(prev).add(showAgreement.agreement_id));
                  setShowAgreement(null);
                }}
                className="w-full bg-black text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

