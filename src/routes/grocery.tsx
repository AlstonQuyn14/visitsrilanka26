import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Check,
  Star,
  Clock,
  Truck,
  Phone,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Grocery prices are in Sri Lankan Rupees; card checkout charges in USD.
const LKR_PER_USD = 300;
function lkrToUsd(lkr: number): number {
  return Math.max(0.7, Math.round((lkr / LKR_PER_USD) * 100) / 100);
}

export const Route = createFileRoute("/grocery")({
  head: () => ({
    meta: [
      { title: "Groceries & Essentials — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Order groceries and essentials from Cargills, Keells, Laughs, Spar and Arpico. Fresh vegetables, food, fast food and daily essentials delivered to your hotel or villa in Sri Lanka.",
      },
      { property: "og:title", content: "Groceries & Essentials — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Shop fresh vegetables, food and essentials from Sri Lanka's top supermarkets, delivered to your door.",
      },
    ],
  }),
  component: Grocery,
});

interface Store {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  eta: string;
  fee: string;
  tone: string;
  emoji: string;
  hotline: string;
}

const stores: Store[] = [
  {
    id: "cargills",
    name: "Cargills Food City",
    tagline: "Island-wide fresh & grocery",
    rating: 4.8,
    eta: "25–35 min",
    fee: "Rs. 250",
    tone: "bg-chart-3/15 text-chart-3",
    emoji: "🛒",
    hotline: "+94 112 421 100",
  },
  {
    id: "keells",
    name: "Keells Super",
    tagline: "Premium quality essentials",
    rating: 4.9,
    eta: "20–30 min",
    fee: "Rs. 300",
    tone: "bg-primary/15 text-primary",
    emoji: "🏪",
    hotline: "+94 117 522 522",
  },
  {
    id: "laughs",
    name: "Laughs Supermarket",
    tagline: "Everyday low prices",
    rating: 4.6,
    eta: "30–40 min",
    fee: "Rs. 200",
    tone: "bg-accent/15 text-accent",
    emoji: "🧺",
    hotline: "+94 112 304 040",
  },
  {
    id: "spar",
    name: "SPAR Sri Lanka",
    tagline: "Fresh, local & global brands",
    rating: 4.7,
    eta: "25–35 min",
    fee: "Rs. 280",
    tone: "bg-chart-5/15 text-chart-5",
    emoji: "🥬",
    hotline: "+94 112 555 777",
  },
  {
    id: "arpico",
    name: "Arpico Supercentre",
    tagline: "Groceries & household goods",
    rating: 4.5,
    eta: "35–45 min",
    fee: "Rs. 220",
    tone: "bg-chart-4/20 text-chart-5",
    emoji: "🛍️",
    hotline: "+94 112 310 000",
  },
  {
    id: "pizzahut",
    name: "Pizza Hut",
    tagline: "Hot, cheesy pizzas to your door",
    rating: 4.7,
    eta: "30–40 min",
    fee: "Rs. 350",
    tone: "bg-destructive/15 text-destructive",
    emoji: "🍕",
    hotline: "+94 117 555 555",
  },
  {
    id: "dominos",
    name: "Domino's Pizza",
    tagline: "Fresh pizza, fast delivery",
    rating: 4.6,
    eta: "25–35 min",
    fee: "Rs. 320",
    tone: "bg-primary/15 text-primary",
    emoji: "🍕",
    hotline: "+94 117 826 826",
  },
];

type Category =
  | "Food"
  | "Vegetables"
  | "Fruits"
  | "Common Food"
  | "Fast Food"
  | "Pizza";

const categories: { label: Category | "All"; emoji: string }[] = [
  { label: "All", emoji: "✨" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Food", emoji: "🍲" },
  { label: "Vegetables", emoji: "🥕" },
  { label: "Fruits", emoji: "🍎" },
  { label: "Common Food", emoji: "🍚" },
  { label: "Fast Food", emoji: "🍔" },
];

interface Item {
  id: string;
  name: string;
  category: Category;
  unit: string;
  price: number;
  emoji: string;
  /** Which stores carry this item. */
  storeIds: string[];
}

// Supermarkets carry the full grocery range.
const SUPERMARKETS = ["cargills", "keells", "laughs", "spar", "arpico"];

const items: Item[] = [
  // Vegetables (supermarkets)
  { id: "carrot", name: "Fresh Carrots", category: "Vegetables", unit: "1 kg", price: 380, emoji: "🥕", storeIds: SUPERMARKETS },
  { id: "tomato", name: "Ripe Tomatoes", category: "Vegetables", unit: "1 kg", price: 420, emoji: "🍅", storeIds: SUPERMARKETS },
  { id: "leeks", name: "Green Leeks", category: "Vegetables", unit: "500 g", price: 260, emoji: "🥬", storeIds: SUPERMARKETS },
  { id: "potato", name: "Potatoes", category: "Vegetables", unit: "1 kg", price: 340, emoji: "🥔", storeIds: SUPERMARKETS },
  { id: "onion", name: "Red Onions", category: "Vegetables", unit: "1 kg", price: 450, emoji: "🧅", storeIds: SUPERMARKETS },
  { id: "chilli", name: "Green Chilli", category: "Vegetables", unit: "250 g", price: 180, emoji: "🌶️", storeIds: SUPERMARKETS },
  // Fruits (supermarkets)
  { id: "banana", name: "Ambul Bananas", category: "Fruits", unit: "1 dozen", price: 360, emoji: "🍌", storeIds: SUPERMARKETS },
  { id: "mango", name: "Sweet Mangoes", category: "Fruits", unit: "1 kg", price: 620, emoji: "🥭", storeIds: SUPERMARKETS },
  { id: "papaya", name: "Fresh Papaya", category: "Fruits", unit: "1 pc", price: 280, emoji: "🍈", storeIds: SUPERMARKETS },
  { id: "pineapple", name: "Pineapple", category: "Fruits", unit: "1 pc", price: 340, emoji: "🍍", storeIds: SUPERMARKETS },
  { id: "watermelon", name: "Watermelon", category: "Fruits", unit: "1 pc", price: 520, emoji: "🍉", storeIds: SUPERMARKETS },
  { id: "apple", name: "Red Apples", category: "Fruits", unit: "1 kg", price: 780, emoji: "🍎", storeIds: SUPERMARKETS },
  // Common Food (staples, supermarkets)
  { id: "rice", name: "Nadu Rice", category: "Common Food", unit: "5 kg", price: 1450, emoji: "🍚", storeIds: SUPERMARKETS },
  { id: "dhal", name: "Red Dhal", category: "Common Food", unit: "1 kg", price: 540, emoji: "🫘", storeIds: SUPERMARKETS },
  { id: "coconut", name: "Fresh Coconut", category: "Common Food", unit: "2 pcs", price: 320, emoji: "🥥", storeIds: SUPERMARKETS },
  { id: "eggs", name: "Farm Eggs", category: "Common Food", unit: "10 pcs", price: 560, emoji: "🥚", storeIds: SUPERMARKETS },
  { id: "bread", name: "Sandwich Bread", category: "Common Food", unit: "1 loaf", price: 240, emoji: "🍞", storeIds: SUPERMARKETS },
  { id: "milk", name: "Fresh Milk", category: "Common Food", unit: "1 L", price: 480, emoji: "🥛", storeIds: SUPERMARKETS },
  // Food (cooked / ready meals, supermarkets)
  { id: "kottu", name: "Chicken Kottu", category: "Food", unit: "1 plate", price: 850, emoji: "🍛", storeIds: SUPERMARKETS },
  { id: "riceandcurry", name: "Rice & Curry", category: "Food", unit: "1 plate", price: 650, emoji: "🍲", storeIds: SUPERMARKETS },
  { id: "hoppers", name: "Egg Hoppers", category: "Food", unit: "3 pcs", price: 420, emoji: "🍳", storeIds: SUPERMARKETS },
  { id: "stringhopper", name: "String Hoppers", category: "Food", unit: "10 pcs", price: 380, emoji: "🍜", storeIds: SUPERMARKETS },
  // Fast Food (supermarkets)
  { id: "burger", name: "Cheese Burger", category: "Fast Food", unit: "1 pc", price: 720, emoji: "🍔", storeIds: SUPERMARKETS },
  { id: "fries", name: "Crispy Fries", category: "Fast Food", unit: "Large", price: 520, emoji: "🍟", storeIds: SUPERMARKETS },
  { id: "shorteats", name: "Short Eats Pack", category: "Fast Food", unit: "6 pcs", price: 480, emoji: "🥟", storeIds: SUPERMARKETS },
  // Pizza Hut menu
  { id: "ph-margherita", name: "Margherita Pizza", category: "Pizza", unit: "Medium", price: 1690, emoji: "🍕", storeIds: ["pizzahut"] },
  { id: "ph-chickensupreme", name: "Chicken Supreme", category: "Pizza", unit: "Large", price: 2890, emoji: "🍕", storeIds: ["pizzahut"] },
  { id: "ph-pepperoni", name: "Pepperoni Feast", category: "Pizza", unit: "Large", price: 2790, emoji: "🍕", storeIds: ["pizzahut"] },
  { id: "ph-veggie", name: "Veggie Delight", category: "Pizza", unit: "Medium", price: 1790, emoji: "🍕", storeIds: ["pizzahut"] },
  { id: "ph-garlicbread", name: "Garlic Bread", category: "Fast Food", unit: "4 pcs", price: 690, emoji: "🥖", storeIds: ["pizzahut"] },
  { id: "ph-wings", name: "Chicken Wings", category: "Fast Food", unit: "6 pcs", price: 1090, emoji: "🍗", storeIds: ["pizzahut"] },
  // Domino's menu
  { id: "dm-margherita", name: "Margherita Pizza", category: "Pizza", unit: "Medium", price: 1590, emoji: "🍕", storeIds: ["dominos"] },
  { id: "dm-cheeseburst", name: "Cheese Burst Pizza", category: "Pizza", unit: "Large", price: 2990, emoji: "🍕", storeIds: ["dominos"] },
  { id: "dm-chickendom", name: "Chicken Dominator", category: "Pizza", unit: "Large", price: 3190, emoji: "🍕", storeIds: ["dominos"] },
  { id: "dm-farmhouse", name: "Farmhouse Pizza", category: "Pizza", unit: "Medium", price: 1890, emoji: "🍕", storeIds: ["dominos"] },
  { id: "dm-garlicbread", name: "Stuffed Garlic Bread", category: "Fast Food", unit: "1 pack", price: 790, emoji: "🥖", storeIds: ["dominos"] },
  { id: "dm-lavacake", name: "Choco Lava Cake", category: "Fast Food", unit: "2 pcs", price: 590, emoji: "🍫", storeIds: ["dominos"] },
];

interface FoodService {
  id: string;
  name: string;
  tagline: string;
  /** Official website — opens so travellers can see the real products. */
  url: string;
  emoji: string;
  tone: string;
}

const foodServices: FoodService[] = [
  {
    id: "pickme-food",
    name: "PickMe Food",
    tagline: "Sri Lanka's #1 food delivery",
    url: "https://pickme.lk/food",
    emoji: "🛵",
    tone: "bg-chart-4/20 text-chart-5",
  },
  {
    id: "uber-eats",
    name: "Uber Eats LK",
    tagline: "Restaurants near you, fast",
    url: "https://www.ubereats.com",
    emoji: "🍔",
    tone: "bg-foreground/10 text-foreground",
  },
  {
    id: "pizzahut",
    name: "Pizza Hut",
    tagline: "Order hot, cheesy pizzas online",
    url: "https://www.pizzahut.lk",
    emoji: "🍕",
    tone: "bg-destructive/15 text-destructive",
  },
  {
    id: "domino",
    name: "Domino's Pizza",
    tagline: "Fresh pizza, fast delivery",
    url: "https://www.dominos.lk",
    emoji: "🍕",
    tone: "bg-primary/15 text-primary",
  },
  {
    id: "kapruka-cake",
    name: "Kapruka Cake",
    tagline: "Cakes, meals & gifts online",
    url: "https://www.kapruka.com/cakes",
    emoji: "🎂",
    tone: "bg-accent/15 text-accent",
  },
  {
    id: "green-cabin",
    name: "Green Cabin",
    tagline: "Classic Sri Lankan restaurant",
    url: "https://www.greencabin.lk",
    emoji: "🥗",
    tone: "bg-chart-3/15 text-chart-3",
  },
  {
    id: "kfc",
    name: "KFC Sri Lanka",
    tagline: "Order online, finger lickin' good",
    url: "https://www.kfc.lk",
    emoji: "🍗",
    tone: "bg-chart-4/20 text-chart-5",
  },
];

type PaymentMethod = "card" | "cod";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "cod", label: "Cash on delivery", hint: "Pay the rider in cash", icon: Banknote },
];

function Grocery() {
  const [store, setStore] = useState<Store | null>(null);
  const [active, setActive] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [paying, setPaying] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const { openCheckout } = usePaddleCheckout();
  const menuRef = useRef<HTMLElement | null>(null);

  const goToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        if (data.user.email) setUserEmail(data.user.email);
      }
    });
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const name =
        typeof e.data === "object" && e.data ? (e.data as any).name : undefined;
      if (name === "checkout.completed") {
        setPaying(false);
        setPlaced(true);
      }
      if (name === "checkout.closed") setPaying(false);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const filtered = useMemo(() => {
    if (!store) return [];
    return items.filter((it) => {
      const inStore = it.storeIds.includes(store.id);
      const matchCat = active === "All" || it.category === active;
      const matchQuery = it.name.toLowerCase().includes(query.trim().toLowerCase());
      return inStore && matchCat && matchQuery;
    });
  }, [store, active, query]);

  // Categories that the selected store actually carries.
  const storeCategories = useMemo(() => {
    if (!store) return categories;
    const present = new Set(
      items.filter((it) => it.storeIds.includes(store.id)).map((it) => it.category),
    );
    return categories.filter((c) => c.label === "All" || present.has(c.label as Category));
  }, [store]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const deliveryFee = store ? Number(store.fee.replace(/[^\d]/g, "")) : 0;
  const total = subtotal + (cartCount > 0 ? deliveryFee : 0);

  const add = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if ((next[id] ?? 0) <= 1) delete next[id];
      else next[id] = next[id] - 1;
      return next;
    });

  // Switching store clears the cart since menus differ between stores.
  const selectStore = (s: Store | null) => {
    setStore(s);
    setCart({});
    setActive("All");
    setQuery("");
  };

  const reset = () => {
    setPlaced(false);
    setCart({});
    setStore(null);
    setActive("All");
    setQuery("");
  };

  async function handleCheckout() {
    if (!store) {
      setStore(stores[0]);
      return;
    }
    // Cash on delivery keeps the existing instant confirmation.
    if (payment === "cod") {
      setPlaced(true);
      return;
    }
    setPaying(true);
    try {
      await openCheckout({
        priceId: "grocery_order_unit",
        quantity: Math.round(lkrToUsd(total) * 100),
        customerEmail: userEmail || undefined,
        customData: {
          kind: "order",
          orderType: "grocery",
          itemId: store.id,
          itemName: `Grocery order · ${store.name}`,
          customerEmail: userEmail,
          ...(userId ? { userId } : {}),
          store: store.name,
          items: String(cartCount),
          totalLkr: String(total),
        },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch {
      setPaying(false);
    }
  }


  if (placed) {
    return (
      <AppShell>
        <h1 className="sr-only">Order placed</h1>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-chart-3/15 text-chart-3">
            <Check className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Order on the way!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your essentials from {store?.name} will arrive in {store?.eta}, delivered
            to your hotel front desk.
          </p>
          <div className="mt-6 w-full rounded-3xl border border-border/60 bg-card p-5 text-left shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-semibold">{cartCount}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold">Rs. {deliveryFee}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-semibold">
                {payment === "card" ? "Card" : "Cash on delivery"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-base">
              <span className="font-semibold">
                {payment === "cod" ? "Pay on arrival" : "Total paid"}
              </span>
              <span className="font-bold text-primary">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={reset}
            className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Order more essentials
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PaymentTestModeBanner />
      <h1 className="sr-only">Groceries & Essentials</h1>

      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary to-accent px-5 pb-8 pt-8 text-primary-foreground">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-primary-foreground/10" />
        <div className="relative flex items-center gap-2 text-sm font-medium opacity-90">
          <ShoppingBag className="h-4 w-4" />
          Essentials & Grocery Delivery
        </div>
        <h2 className="relative mt-2 text-2xl font-bold leading-tight">
          Fresh food & daily essentials, to your door
        </h2>
        <p className="relative mt-1 text-sm opacity-90">
          Delivered to hotels & villas across Sri Lanka 🇱🇰
        </p>

        {/* Search */}
        <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-foreground shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rice, vegetables, burger…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* Stores */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-5">
          <h3 className="text-base font-bold">Choose a store</h3>
          {store && (
            <button
              onClick={() => selectStore(null)}
              className="text-xs font-medium text-primary"
            >
              Change
            </button>
          )}
        </div>

        {store ? (
          <div className="mt-3 px-5">
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <span className={cn("grid h-12 w-12 place-items-center rounded-2xl text-2xl", store.tone)}>
                  {store.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{store.name}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-chart-4 text-chart-4" /> {store.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {store.eta}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" /> {store.fee}
                    </span>
                  </div>
                </div>
                <Check className="h-5 w-5 text-primary" />
              </div>

              {/* Hotline + Book a food with us */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${store.hotline.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-primary/30 bg-card px-3 py-2.5 text-xs font-semibold text-primary transition-transform active:scale-95"
                >
                  <Phone className="h-3.5 w-3.5" /> Call hotline
                </a>
                <button
                  type="button"
                  onClick={goToMenu}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Book a food with us
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Order from {store.name} and pay securely in-app — your money is
                handled by Visit Sri Lanka, so you don't get scammed. Or call the
                hotline to order directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => selectStore(s)}
                className="flex w-40 shrink-0 flex-col rounded-3xl border border-border/60 bg-card p-4 text-left shadow-sm transition-transform active:scale-95"
              >
                <span className={cn("grid h-12 w-12 place-items-center rounded-2xl text-2xl", s.tone)}>
                  {s.emoji}
                </span>
                <p className="mt-3 text-sm font-semibold leading-tight">{s.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.tagline}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-chart-4 text-chart-4" /> {s.rating}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {s.eta}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>


      {/* Food delivery services */}
      <section className="mt-6">
        <div className="px-5">
          <h3 className="text-base font-bold">Order in from food delivery 🛵</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap to call the hotline and order hot meals straight to you.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {foodServices.map((f) => (
            <a
              key={f.id}
              href={`tel:${f.hotline.replace(/\s/g, "")}`}
              className="flex flex-col rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-transform active:scale-95"
            >
              <span className={cn("grid h-11 w-11 place-items-center rounded-2xl text-2xl", f.tone)}>
                {f.emoji}
              </span>
              <p className="mt-3 text-sm font-semibold leading-tight">{f.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{f.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
                <Phone className="h-3 w-3" /> {f.hotline}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Payment method */}
      <section className="mt-6">
        <h3 className="px-5 text-base font-bold">Payment method</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {paymentMethods.map((p) => {
            const Icon = p.icon;
            const selected = payment === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-3xl border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-card",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                    selected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{p.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{p.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {!store ? (
        <section className="mt-8 px-5">
          <div className="rounded-3xl border border-dashed border-border/70 bg-card p-6 text-center">
            <p className="text-sm font-semibold text-foreground">
              Pick a store to see its menu
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a supermarket for groceries & fruits, or Pizza Hut / Domino's
              for pizza. We only show what that store actually carries.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section ref={menuRef} className="mt-6 scroll-mt-4">
            <h3 className="px-5 text-base font-bold">Categories</h3>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
              {storeCategories.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setActive(c.label)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active === c.label
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card text-foreground",
                  )}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {/* Items */}
          <section className="mt-5 px-5">
            <h3 className="text-base font-bold">
              {active === "All" ? `${store.name} menu` : active}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </h3>


        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No items found. Try another search.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {filtered.map((it) => {
              const qty = cart[it.id] ?? 0;
              return (
                <div
                  key={it.id}
                  className="flex flex-col rounded-3xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="grid h-16 place-items-center rounded-2xl bg-secondary/60 text-4xl">
                    {it.emoji}
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-tight">{it.name}</p>
                  <p className="text-[11px] text-muted-foreground">{it.unit}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">Rs. {it.price}</span>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(it.id)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                        aria-label={`Add ${it.name}`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => remove(it.id)}
                          className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground transition-transform active:scale-90"
                          aria-label={`Remove ${it.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                        <button
                          onClick={() => add(it.id)}
                          className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                          aria-label={`Add ${it.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </section>
        </>
      )}


      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <button
            onClick={handleCheckout}
            disabled={paying}
            className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/20">
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </span>
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold">
              {!store
                ? "Select store"
                : payment === "cod"
                  ? `Place order · Rs. ${total.toLocaleString()}`
                  : `Pay $${lkrToUsd(total).toLocaleString()}`}
            </span>
          </button>
        </div>
      )}
    </AppShell>
  );
}
