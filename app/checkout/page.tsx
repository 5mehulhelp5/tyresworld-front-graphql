"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, CheckCircle, ShoppingBag, Loader2,
  Truck, CreditCard,
  Car, ChevronDown, ChevronUp,
  MapPin, Search, Crosshair, Store, Package, Contact
} from "lucide-react";
import StoreLocatorMap, { type StoreLocation } from "@/components/StoreLocatorMap";
import { useCart } from "@/lib/cart-context";
import type { ShippingMethodOption } from "@/lib/types";
import { Money } from "@/components/Price";

// Haversine distance calculator
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
  city: "",
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

const DEFAULT_PAYMENT_METHODS = [
  {
    code: "payonline",
    title: "Credit/Debit Card – Pay Online",
    description: "You will be redirected to our partner's website, where you can safely pay.",
  },
  {
    code: "apple_pay",
    title: "Apple Pay",
    description: "",
  },
  {
    code: "payment_link",
    title: "Pay via Payment Link",
    description: "",
  },
];

/* ─── Main page ──────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const { cartId, cartToken, items, count, subtotal, grandTotal, currency, cart, ready, applyCoupon, removeCoupon, clearLocal, refresh } = useCart();

  const [form,            setForm]            = useState({ ...EMPTY_FORM });
  const [sameAsShipping,  setSameAsShipping]  = useState(true);
  const [, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [paymentMethods,  setPaymentMethods]  = useState<{ code: string; title: string; description?: string }[]>(DEFAULT_PAYMENT_METHODS);
  const [selShipping,     setSelShipping]     = useState("");
  const [selPayment,      setSelPayment]      = useState("payonline");
  const [busy,            setBusy]            = useState(false);
  const [,  setLoadingMethods]  = useState(false);
  const [error,           setError]           = useState("");
  const [orderNumber,     setOrderNumber]     = useState<string | null>(null);
  const [agreements,      setAgreements]      = useState<Agreement[]>([]);
  const [agreedIds,       setAgreedIds]       = useState<Set<number>>(new Set());
  const [showAgreement,   setShowAgreement]   = useState<Agreement | null>(null);
  const [step,            setStep]            = useState<"delivery" | "checkout" | "done">("checkout");
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
          // Set default installation if not yet selected
          setInstallation(prev => {
            if (prev) return prev;
            return {
              type: "install_outlet",
              branch: { id: d.branches[0].id, name: d.branches[0].name, address: d.branches[0].address, city: d.branches[0].city },
              date: "2026-09-21",
              time: "10:00 AM - 12:00 PM",
            };
          });
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
  }, [locale]);

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
      date: selectedDate || upcomingDates[0]?.value || "2026-09-21",
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
      date: mobileDate || upcomingDates[0]?.value || "2026-09-21",
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

  /* Persist installer selection to backend quote */
  useEffect(() => {
    if (!cartId || !installation || installerSaveState !== "idle") return;

    const mode =
      installation.type === "install_outlet" ? "install_at_outlet"
      : installation.type === "mobile_van" ? "mobile_van_service"
      : installation.type;
    if (!mode) return;

    setInstallerSaveState("saving");
    (async () => {
      const res = await api({
        op: "setInstallerSelection",
        cartId,
        deliveryMode: mode,
        storeId: installation.branch?.id,
        pickupLocation: installation.mobileAddress,
        pickupDate: installation.date,
        pickupTime: installation.time,
        token: cartToken || undefined,
      });
      if (res.error) {
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

  // Ensure latest cart data is loaded
  useEffect(() => {
    refresh();
  }, [refresh]);

  const allAgreed = agreements.length === 0 || agreements.every(a => agreedIds.has(a.agreement_id));
  const discounts      = cart?.prices?.discounts ?? [];
  const discountAmount = discounts.reduce((s, d) => s + Math.abs(d.amount.value), 0);
  const appliedTaxes   = cart?.prices?.applied_taxes ?? [];
  const subtotalExclTax = cart?.prices?.subtotal_excluding_tax?.value ?? subtotal;
  const shippingAmount = cart?.shipping_addresses?.[0]?.selected_shipping_method?.amount?.value ?? 0;
  
  const vatAmount = appliedTaxes.length > 0 
    ? appliedTaxes.reduce((s, t) => s + t.amount.value, 0)
    : (cart?.prices?.subtotal_including_tax?.value && cart?.prices?.subtotal_excluding_tax?.value
        ? Math.max(0, Math.round((cart.prices.subtotal_including_tax.value - cart.prices.subtotal_excluding_tax.value) * 100) / 100)
        : Math.round(subtotalExclTax * 0.05 * 100) / 100);

  const grandTotalValue = grandTotal || (cart?.prices?.grand_total?.value ?? (subtotalExclTax + vatAmount + shippingAmount - discountAmount));
  const totalCount     = count || items.reduce((s, it) => s + (it.quantity || 1), 0);
  const tok            = cartToken || undefined;

  const appliedCoupon = cart?.applied_coupons?.[0]?.code;

  const money = (v: number) => <Money value={v} currency={currency || "AED"} digits={2} />;

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function buildAddress() {
    return {
      firstname:    form.firstname || "Customer",
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
    const emailToUse = form.email || `${form.telephone ? form.telephone.replace(/\D/g, "") : "guest"}@tyresworld.ae`;
    const isAddressValid = form.firstname && form.lastname && form.street && form.city && form.telephone;

    if (!isAddressValid) return;

    let active = true;
    const debouncer = setTimeout(async () => {
      setLoadingMethods(true);
      try {
        await api({ op: "setEmail", cartId, email: emailToUse, token: tok });
        if (!active) return;

        const shipRes = await api({ op: "setShippingAddress", cartId, address: buildAddress(), token: tok });
        if (!active) return;
        if (shipRes.error || !shipRes.cart) return;

        const addr     = (shipRes.cart as Record<string, unknown>).shipping_addresses as { available_shipping_methods?: ShippingMethodOption[] }[] | undefined;
        const methods  = (addr?.[0]?.available_shipping_methods ?? []).filter((m) => m.available);
        const payments = ((shipRes.cart as Record<string, unknown>).available_payment_methods as { code: string; title: string }[]) ?? [];

        setShippingMethods(methods);
        if (payments.length > 0) {
          setPaymentMethods(payments.map(p => ({
            code: p.code,
            title: p.title,
            description: p.code.toLowerCase().includes("payonline") || p.code.toLowerCase().includes("cc")
              ? "You will be redirected to our partner's website, where you can safely pay."
              : "",
          })));
        }

        if (methods.length > 0 && !selShipping) {
          setSelShipping(`${methods[0].carrier_code}|${methods[0].method_code}`);
          await api({ op: "setShippingMethod", cartId, carrier: methods[0].carrier_code, method: methods[0].method_code, token: tok });
        }
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingMethods(false);
      }
    }, 800);

    return () => {
      active = false;
      clearTimeout(debouncer);
    };
  }, [form.email, form.firstname, form.lastname, form.street, form.city, form.telephone, form.country_code, form.region, form.company, cartId, tok, refresh, selShipping]);

  const [couponLoading,   setCouponLoading]   = useState(false);

  // Handle manual Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponSuccess(false);
    setCouponLoading(true);
    try {
      const err = await applyCoupon(couponInput.trim());
      if (err) {
        setCouponError(err);
      } else {
        setCouponSuccess(true);
        setCouponInput("");
      }
    } catch {
      setCouponError("Could not apply the coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle manual Remove Coupon
  const handleRemoveCoupon = async () => {
    setCouponError("");
    setCouponSuccess(false);
    setCouponLoading(true);
    try {
      await removeCoupon();
    } catch {
      setCouponError("Could not remove the coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const getSelectedPaymentCode = () => selPayment || paymentMethods[0]?.code || "payonline";

  // Complete Checkout Placement
  async function handlePlaceOrder() {
    if (!cartId) return;

    if (!form.firstname || !form.lastname) {
      setError("Please enter your first and last name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!form.street || !form.city) {
      setError("Please enter your street address and select your city.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!form.telephone) {
      setError("Please enter your mobile phone number.");
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
      const emailToUse = form.email || `${form.telephone.replace(/\D/g, "")}@tyresworld.ae`;

      // 1. Set guest email
      const emailRes = await api({ op: "setEmail", cartId, email: emailToUse, token: tok });
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

          {deliveryMode === "install_outlet" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6 items-start">
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {filteredBranches.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-gray-500 text-sm">No fitting partners found for this search or city.</p>
                  </div>
                ) : (
                  filteredBranches.map((branch) => {
                    const isSelected = selectedStoreId === branch.id;
                    const isExpanded = expandedStoreId === branch.id;
                    return (
                      <div
                        key={branch.id}
                        className={`bg-white border rounded-xl p-5 transition-all ${
                          isSelected ? "border-black ring-1 ring-black/5 shadow-xs" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-sm text-gray-900">{branch.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">{branch.address}, {branch.city}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStoreId(branch.id);
                              setExpandedStoreId(isExpanded ? null : branch.id);
                            }}
                            className="text-xs font-bold text-black border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                              {upcomingDates.slice(0, 4).map((d) => (
                                <button
                                  key={d.value}
                                  type="button"
                                  onClick={() => setSelectedDate(d.value)}
                                  className={`px-3 py-1.5 rounded text-xs font-bold ${
                                    selectedDate === d.value ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleConfirmStoreBooking(branch)}
                              className="bg-black hover:bg-[#ed1c24] text-white px-6 py-2.5 rounded font-black text-xs uppercase tracking-wider transition-colors"
                            >
                              Confirm Booking
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-[600px] sticky top-8">
                <StoreLocatorMap
                  stores={filteredBranches}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={(store) => {
                    setSelectedStoreId(store.id);
                    setExpandedStoreId(store.id);
                  }}
                  locale={locale}
                />
              </div>
            </div>
          )}

          {deliveryMode === "mobile_van" && (
            <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-base text-gray-900">Enter Your Location for Mobile Fitting</h3>
              <input
                type="text"
                placeholder="Enter street address & area"
                value={mobileAddress}
                onChange={(e) => setMobileAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleConfirmMobileVan}
                className="w-full bg-black hover:bg-[#ed1c24] text-white py-3 rounded font-black text-xs uppercase tracking-wider transition-colors"
              >
                Confirm Mobile Fitting
              </button>
            </div>
          )}

          {deliveryMode === "free_shipping" && (
            <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 text-center space-y-4">
              <h3 className="font-bold text-base text-gray-900">Doorstep Delivery Without Fitment</h3>
              <p className="text-xs text-gray-500">Your tyres will be delivered directly to your billing/shipping address.</p>
              <button
                type="button"
                onClick={handleConfirmFreeShipping}
                className="w-full bg-black hover:bg-[#ed1c24] text-white py-3 rounded font-black text-xs uppercase tracking-wider transition-colors"
              >
                Continue to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Main Checkout Step ────────────────────────────────────────── */
  const displayInstallerName =
    installation?.branch?.name || activeBranch?.name || "Tyre Rack Car Tyre Service L.L.C";
  const displayDate = installation?.date || selectedDate || "2026-09-21";
  const displayTime = installation?.time || selectedTimeSlot || "10:00 AM - 12:00 PM";

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-white uppercase font-sans">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          
          {/* ════════════════ LEFT COLUMN: FORMS ════════════════ */}
          <div className="space-y-6">
            
            {/* 1. BILLING ADDRESS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f4f5f7] px-5 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
                <Contact className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">BILLING ADDRESS</h2>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstname}
                      onChange={set("firstname")}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.lastname}
                      onChange={set("lastname")}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set("company")}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.street}
                      onChange={set("street")}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={form.telephone}
                      onChange={set("telephone")}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={form.city}
                        onChange={set("city")}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all appearance-none pr-9 cursor-pointer bg-white"
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
              </div>
            </div>

            {/* 2. VEHICLE INFORMATION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f4f5f7] px-5 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
                <Car className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">VEHICLE INFORMATION</h2>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Vehicle Plate
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Make</label>
                    <div className="relative">
                      <select
                        value={selectedMake}
                        onChange={e => handleMakeChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all appearance-none pr-9 cursor-pointer bg-white"
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
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={e => handleModelChange(e.target.value)}
                        disabled={!selectedMake}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all appearance-none pr-9 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer bg-white"
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
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Year</label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        disabled={!selectedModel}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-black transition-all appearance-none pr-9 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer bg-white"
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

            {/* 3. SHIPPING METHODS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f4f5f7] px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-gray-700" />
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">SHIPPING METHODS</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("delivery");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="p-5">
                <div className="border border-emerald-500 bg-[#f4fbf7] rounded-lg py-4 px-5 text-center">
                  <div className="font-bold text-xs tracking-wider text-emerald-950 uppercase mb-2">
                    SELECTED INSTALLER
                  </div>
                  <div className="text-xs text-gray-800 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                    <span>
                      <span className="font-semibold text-gray-900">Mode:</span>{" "}
                      {deliveryMode === "install_outlet" ? "Install at Outlet" : deliveryMode === "mobile_van" ? "Mobile Van Service" : "Free Shipping"}
                    </span>
                    {deliveryMode === "install_outlet" && (
                      <span>
                        <span className="font-semibold text-gray-900">Installer:</span>{" "}
                        {displayInstallerName}
                      </span>
                    )}
                    {deliveryMode === "mobile_van" && (
                      <span>
                        <span className="font-semibold text-gray-900">Location:</span>{" "}
                        {mobileAddress || "Your Doorstep"}
                      </span>
                    )}
                    <span>
                      <span className="font-semibold text-gray-900">Date:</span>{" "}
                      {displayDate}
                    </span>
                    <span>
                      <span className="font-semibold text-gray-900">Time:</span>{" "}
                      {displayTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PAYMENT METHOD */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-[#f4f5f7] px-5 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">PAYMENT METHOD</h2>
              </div>

              <div className="p-5 space-y-3.5">
                {paymentMethods.map((pm) => {
                  const isSelected = selPayment === pm.code;
                  return (
                    <div key={pm.code} className="space-y-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={isSelected}
                          onChange={() => setSelPayment(pm.code)}
                          className="w-4 h-4 text-red-600 focus:ring-0 accent-red-600 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          {pm.title}
                        </span>
                      </label>
                      {pm.description && isSelected && (
                        <p className="text-[11px] sm:text-xs text-gray-600 pl-7">
                          {pm.description}
                        </p>
                      )}
                    </div>
                  );
                })}
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
              <div className="px-5 py-3.5 bg-[#f4f5f7] border-b border-gray-200 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-900">ORDER SUMMARY</h2>
              </div>

              {/* Items in Cart Accordion */}
              <div className="bg-white">
                <button
                  type="button"
                  onClick={() => setIsItemsListOpen(!isItemsListOpen)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-gray-800 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span>{totalCount} Items in Cart</span>
                  {isItemsListOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {isItemsListOpen && (
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto px-5 py-2">
                    {items.map((it) => {
                      const itemPrice =
                        it.prices?.row_total_including_tax?.value ??
                        it.prices?.row_total?.value ??
                        ((it.prices?.price_including_tax?.value ?? it.prices?.price?.value ?? 0) * (it.quantity || 1));

                      return (
                        <div key={it.uid} className="flex items-center gap-3 py-3">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-2xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={it.product.thumbnail?.url ?? "/img/tyre-placeholder.png"}
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
                              {money(itemPrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white px-5 py-4 border-t border-gray-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-gray-900">{money(subtotalExclTax)}</span>
                </div>

                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Additional Charge</span>
                  <span className="font-bold text-gray-900">{money(shippingAmount)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Discount</span>
                    <span>− {money(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700 font-medium">
                  <span>VAT (5%)</span>
                  <span className="font-bold text-gray-900">{money(vatAmount)}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-3">
                  <span>Order Total</span>
                  <span className="font-black text-gray-900">{money(grandTotalValue)}</span>
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
                        disabled={couponLoading}
                        className="text-[11px] font-bold text-red-600 hover:underline disabled:opacity-50"
                      >
                        {couponLoading ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value)}
                        disabled={couponLoading}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black bg-white disabled:bg-gray-50"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {couponLoading && <Loader2 size={12} className="animate-spin" />}
                        <span>{couponLoading ? "Applying..." : "Apply"}</span>
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
