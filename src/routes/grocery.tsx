import { useMemo, useState } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/grocery")({
  head: () => ({
    meta: [
      { title: "Groceries & Essentials — Serendib" },
      {
        name: "description",
        content:
          "Order groceries and essentials from Cargills, Keells, Laughs, Spar and Arpico. Fresh vegetables, food, fast food and daily essentials delivered to your hotel or villa in Sri Lanka.",
      },
      { property: "og:title", content: "Groceries & Essentials — Serendib" },
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
  },
];

type Category = "Food" | "Vegetables" | "Common Food" | "Fast Food";

const categories: { label: Category | "All"; emoji: string }[] = [
  { label: "All", emoji: "✨" },
  { label: "Food", emoji: "🍲" },
  { label: "Vegetables", emoji: "🥕" },
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
}

const items: Item[] = [
  // Vegetables
  { id: "carrot", name: "Fresh Carrots", category: "Vegetables", unit: "1 kg", price: 380, emoji: "🥕" },
  { id: "tomato", name: "Ripe Tomatoes", category: "Vegetables", unit: "1 kg", price: 420, emoji: "🍅" },
  { id: "leeks", name: "Green Leeks", category: "Vegetables", unit: "500 g", price: 260, emoji: "🥬" },
  { id: "potato", name: "Potatoes", category: "Vegetables", unit: "1 kg", price: 340, emoji: "🥔" },
  { id: "onion", name: "Red Onions", category: "Vegetables", unit: "1 kg", price: 450, emoji: "🧅" },
  { id: "chilli", name: "Green Chilli", category: "Vegetables", unit: "250 g", price: 180, emoji: "🌶️" },
  // Common Food (staples)
  { id: "rice", name: "Nadu Rice", category: "Common Food", unit: "5 kg", price: 1450, emoji: "🍚" },
  { id: "dhal", name: "Red Dhal", category: "Common Food", unit: "1 kg", price: 540, emoji: "🫘" },
  { id: "coconut", name: "Fresh Coconut", category: "Common Food", unit: "2 pcs", price: 320, emoji: "🥥" },
  { id: "eggs", name: "Farm Eggs", category: "Common Food", unit: "10 pcs", price: 560, emoji: "🥚" },
  { id: "bread", name: "Sandwich Bread", category: "Common Food", unit: "1 loaf", price: 240, emoji: "🍞" },
  { id: "milk", name: "Fresh Milk", category: "Common Food", unit: "1 L", price: 480, emoji: "🥛" },
  // Food (cooked / ready meals)
  { id: "kottu", name: "Chicken Kottu", category: "Food", unit: "1 plate", price: 850, emoji: "🍛" },
  { id: "riceandcurry", name: "Rice & Curry", category: "Food", unit: "1 plate", price: 650, emoji: "🍲" },
  { id: "hoppers", name: "Egg Hoppers", category: "Food", unit: "3 pcs", price: 420, emoji: "🍳" },
  { id: "stringhopper", name: "String Hoppers", category: "Food", unit: "10 pcs", price: 380, emoji: "🍜" },
  // Fast Food
  { id: "burger", name: "Cheese Burger", category: "Fast Food", unit: "1 pc", price: 720, emoji: "🍔" },
  { id: "pizza", name: "Veggie Pizza", category: "Fast Food", unit: "Medium", price: 1650, emoji: "🍕" },
  { id: "fries", name: "Crispy Fries", category: "Fast Food", unit: "Large", price: 520, emoji: "🍟" },
  { id: "shorteats", name: "Short Eats Pack", category: "Fast Food", unit: "6 pcs", price: 480, emoji: "🥟" },
];

interface FoodService {
  id: string;
  name: string;
  tagline: string;
  hotline: string;
  emoji: string;
  tone: string;
}

const foodServices: FoodService[] = [
  {
    id: "pickme-food",
    name: "PickMe Food",
    tagline: "Sri Lanka's #1 food delivery",
    hotline: "+94 117 429 429",
    emoji: "🛵",
    tone: "bg-chart-4/20 text-chart-5",
  },
  {
    id: "uber-eats",
    name: "Uber Eats LK",
    tagline: "Restaurants near you, fast",
    hotline: "+94 117 455 455",
    emoji: "🍔",
    tone: "bg-foreground/10 text-foreground",
  },
  {
    id: "kapruka",
    name: "Kapruka Food",
    tagline: "Meals, cakes & groceries",
    hotline: "+94 117 551 111",
    emoji: "🎂",
    tone: "bg-accent/15 text-accent",
  },
  {
    id: "uber-ceylon",
    name: "Glovo Ceylon",
    tagline: "Anything delivered in minutes",
    hotline: "+94 117 200 200",
    emoji: "🥡",
    tone: "bg-chart-3/15 text-chart-3",
  },
  {
    id: "domino",
    name: "Domino's Pizza",
    tagline: "Hot pizza hotline delivery",
    hotline: "+94 117 826 826",
    emoji: "🍕",
    tone: "bg-primary/15 text-primary",
  },
  {
    id: "kfc",
    name: "KFC Sri Lanka",
    tagline: "Finger lickin' delivery",
    hotline: "+94 115 777 777",
    emoji: "🍗",
    tone: "bg-destructive/15 text-destructive",
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

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchCat = active === "All" || it.category === active;
      const matchQuery = it.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchCat && matchQuery;
    });
  }, [active, query]);

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

  const reset = () => {
    setPlaced(false);
    setCart({});
    setStore(null);
    setActive("All");
    setQuery("");
  };

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
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-base">
              <span className="font-semibold">Total paid</span>
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
          <h3 className="text-base font-bold">Choose a supermarket</h3>
          {store && (
            <button
              onClick={() => setStore(null)}
              className="text-xs font-medium text-primary"
            >
              Change
            </button>
          )}
        </div>

        {store ? (
          <div className="mt-3 px-5">
            <div className="flex items-center gap-3 rounded-3xl border border-primary/30 bg-primary/5 p-4">
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
          </div>
        ) : (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => setStore(s)}
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

      {/* Categories */}
      <section className="mt-6">
        <h3 className="px-5 text-base font-bold">Categories</h3>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          {categories.map((c) => (
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
          {active === "All" ? "All items" : active}{" "}
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

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <button
            onClick={() => {
              if (!store) {
                setStore(stores[0]);
                return;
              }
              setPlaced(true);
            }}
            className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/20">
                <ShoppingCart className="h-4 w-4" />
              </span>
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold">
              {store ? `Checkout · Rs. ${total.toLocaleString()}` : "Select store"}
            </span>
          </button>
        </div>
      )}
    </AppShell>
  );
}
