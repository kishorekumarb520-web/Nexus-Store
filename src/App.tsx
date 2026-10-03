import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Package,
  PackageCheck,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

// ---- persistent storage typing (window.storage is injected by the host) ----
type StorageResult = { key: string; value: string; shared: boolean } | null;
declare global {
  interface Window {
    storage: {
      get: (key: string, shared?: boolean) => Promise<StorageResult>;
      set: (key: string, value: string, shared?: boolean) => Promise<StorageResult>;
      delete: (
        key: string,
        shared?: boolean,
      ) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (
        prefix?: string,
        shared?: boolean,
      ) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

type Product = {
  id: number;
  brand: string;
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
  rating: number;
  badge?: string;
};
type CartLine = Product & { quantity: number };

// NOTE: this is a client-side demo account system. Passwords are stored as
// plain text in window.storage purely so sign-in can check them locally —
// this is NOT how real authentication should work and should be replaced
// with a real backend + hashed passwords before this ever handles real users.
type StoredUser = { email: string; name: string; password: string; joinedAt: string };
type UserProfile = { email: string; name: string; joinedAt: string };
type AuthResult = { ok: boolean; message: string };

type Address = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};
type Order = {
  id: string;
  items: CartLine[];
  address: Address;
  total: number;
  placedAt: string;
};

const seedProducts: Product[] = [
  {
    id: 1,
    brand: "Adidas Evo SL",
    name: "Running Shoes",
    price: 12000,
    oldPrice: 16000,
    category: "Footwear",
    image:
      "https://assets.myntassets.com/assets/images/2026/MARCH/21/KgLaggtn_61961efa695543c7b3584f4b1e7ec967.jpg",
    rating: 4.5,
    badge: "Best seller",
  },
  {
    id: 2,
    brand: "Puma",
    name: "Printed overshirt",
    price: 899,
    oldPrice: 1299,
    category: "Men",
    image:
      "https://images.vegnonveg.com/resized/1020X1200/12595/puma-oversized-pants-wv-puma-black-67b86f1c5c1e4.jpg?format=webp",
    rating: 4.4,
    badge: "New",
  },
  {
    id: 3,
    brand: "Serein",
    name: "Mini shoulder bag",
    price: 499,
    oldPrice: 709,
    category: "Accessories",
    image:
      "https://assets.ajio.com/medias/sys_master/root/20240913/JjHM/66e43e6f6f60443f31791dc1/-473Wx593H-700328358-grey-MODEL.jpg",
    rating: 4.6,
  },
  {
    id: 4,
    brand: "Nike Air Max",
    name: "Running Shoes",
    price: 769,
    oldPrice: 1089,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    rating: 4.7,
    badge: "Few left",
  },
  {
    id: 5,
    brand: "Kora",
    name: "Ribbed fitted midi dress",
    price: 549,
    oldPrice: 769,
    category: "Women",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
    rating: 4.3,
  },
  {
    id: 6,
    brand: "The Sunday Club",
    name: "Washed cotton tee",
    price: 249,
    oldPrice: 349,
    category: "Men",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    rating: 4.6,
  },
  {
    id: 7,
    brand: "Marlow",
    name: "Casual Blue WaterProof Backpack",
    price: 349,
    oldPrice: 489,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    rating: 4.5,
    badge: "Best seller",
  },
  {
    id: 8,
    brand: "Lumen",
    name: "Suede western ankle Heals",
    price: 869,
    oldPrice: 1209,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85",
    rating: 4.8,
  },
  {
    id: 9,
    brand: "Kora",
    name: "Tailored Leather Jacket",
    price: 5699,
    oldPrice: 8099,
    category: "Men",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    rating: 4.5,
  },
  {
    id: 10,
    brand: "Northland",
    name: "Merino half Hand sleeve T-shirt",
    price: 699,
    oldPrice: 989,
    category: "Men",
    image:
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=85",
    rating: 4.6,
  },
  {
    id: 11,
    brand: "Serein",
    name: "Oval frame sunglasses",
    price: 319,
    oldPrice: 449,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    rating: 4.4,
  },
  {
    id: 12,
    brand: "Atelier No. 8",
    name: "Minimal slide sandals",
    price: 4299,
    oldPrice: 6099,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=85",
    rating: 4.5,
  },
];
const departments = [
  "Mobiles",
  "Electronics",
  "Men's wear",
  "Women's wear",
  "Kids wear",
  "Accessories",
  "Footwear",
];
const brands: Record<string, string[]> = {
  Mobiles: ["Samsung", "Apple", "OnePlus", "Xiaomi", "Google Pixel", "Nothing"],
  Electronics: ["Sony", "boAt", "JBL", "LG", "Philips", "Lenovo"],
  "Men's wear": [
    "Levi's",
    "Puma",
    "Adidas",
    "Tommy Hilfiger",
    "U.S. Polo Assn.",
    "Wrogn",
  ],
  "Women's wear": ["Biba", "AND", "Zara", "H&M", "Only", "Vero Moda"],
  "Kids wear": ["GAP Kids", "Mothercare", "Hopscotch", "UCB Kids", "Puma Kids"],
  Accessories: ["Fossil", "Titan", "Ray-Ban", "Caprese", "Allen Solly"],
  Footwear: ["Nike", "Adidas", "Puma", "Skechers", "Crocs"],
};
const categoryImages: Record<string, string> = {
  Mobiles: "https://etimg.etb2bimg.com/photo/98913352.cms",
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85",
  "Men's wear":
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=85",
  "Women's wear":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
  "Kids wear":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=85",
  Accessories:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  Footwear:
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=85",
};
const imageKeywords: Record<string, string> = {
  Mobiles: "smartphone,mobile",
  Electronics: "electronics,gadget",
  "Men's wear": "mens,fashion",
  "Women's wear": "womens,fashion",
  "Kids wear": "kids,fashion",
  Accessories: "fashion,accessory",
  Footwear: "shoes,footwear",
};
const uniqueProductImage = (category: string, index: number) =>
  `https://loremflickr.com/900/1200/${imageKeywords[category]}?lock=${index + 1000}`;
const productNouns: Record<string, string[]> = {
  Mobiles: [
    "5G smartphone",
    "Pro Max smartphone",
    "Ultra camera phone",
    "Flip smartphone",
  ],
  Electronics: [
    "wireless headphones",
    "smart watch",
    "4K smart television",
    "Bluetooth speaker",
    "gaming laptop",
  ],
  "Men's wear": [
    "slim fit shirt",
    "relaxed fit jeans",
    "cotton polo",
    "running jacket",
  ],
  "Women's wear": [
    "floral midi dress",
    "wide-leg trousers",
    "linen co-ord set",
    "oversized shirt",
  ],
  "Kids wear": [
    "graphic tee set",
    "party dress",
    "playful sneakers",
    "denim jacket",
  ],
  Accessories: [
    "analogue watch",
    "crossbody bag",
    "polarised sunglasses",
    "leather wallet",
  ],
  Footwear: [
    "running sneakers",
    "casual trainers",
    "slide sandals",
    "ankle boots",
  ],
};
const extraProducts: Product[] = Array.from({ length: 1050 }, (_, i) => {
  const category = departments[i % departments.length],
    brand = brands[category][i % brands[category].length],
    base =
      category === "Mobiles"
        ? 12999
        : category === "Electronics"
          ? 2499
          : category === "Accessories"
            ? 899
            : category === "Footwear"
              ? 1499
              : 699;
  const price = base + (i % 19) * Math.round(base * 0.11);
  return {
    id: 100 + i,
    brand,
    name: `${productNouns[category][i % productNouns[category].length]} · ${2026 + (i % 3)} edition`,
    price,
    oldPrice: Math.round(price * 1.32),
    category,
    image: uniqueProductImage(category, i),
    rating: 4 + (i % 9) / 10,
    badge: i % 17 === 0 ? "Bestseller" : i % 29 === 0 ? "New" : undefined,
  };
});
const products = [...seedProducts, ...extraProducts];
const productsById = new Map(products.map((p) => [p.id, p]));
const categories = ["All", ...departments];
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

type Page = "shop" | "cart" | "account" | "wishlist";

export default function App() {
  const [page, setPage] = useState<Page>("shop"),
    [cart, setCart] = useState<CartLine[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [sort, setSort] = useState("featured"),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [saved, setSaved] = useState<number[]>([]),
    [wishlistLoaded, setWishlistLoaded] = useState(false),
    [users, setUsers] = useState<StoredUser[]>([]),
    [user, setUser] = useState<UserProfile | null>(null),
    [orders, setOrders] = useState<Order[]>([]),
    [loadingUser, setLoadingUser] = useState(true);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2200);
  };

  // Load saved accounts, the active session, that account's orders, and the
  // wishlist once on start.
  useEffect(() => {
    (async () => {
      let loadedUsers: StoredUser[] = [];
      try {
        const res = await window.storage.get("users", false);
        if (res) loadedUsers = JSON.parse(res.value);
      } catch {
        // no accounts saved yet
      }
      setUsers(loadedUsers);

      try {
        const res = await window.storage.get("wishlist", false);
        if (res) {
          const ids = JSON.parse(res.value);
          if (Array.isArray(ids)) setSaved(ids.filter((id) => productsById.has(id)));
        }
      } catch {
        // no wishlist saved yet
      } finally {
        setWishlistLoaded(true);
      }

      let sessionEmail: string | null = null;
      try {
        const res = await window.storage.get("session", false);
        if (res) sessionEmail = JSON.parse(res.value);
      } catch {
        // no active session
      }

      if (sessionEmail) {
        const found = loadedUsers.find(
          (u) => u.email.toLowerCase() === sessionEmail!.toLowerCase(),
        );
        if (found) {
          setUser({ email: found.email, name: found.name, joinedAt: found.joinedAt });
          try {
            const res = await window.storage.get(
              `orders:${found.email.toLowerCase()}`,
              false,
            );
            if (res) setOrders(JSON.parse(res.value));
          } catch {
            // no orders saved yet for this account
          }
        }
      }
      setLoadingUser(false);
    })();
  }, []);

  // Persist the wishlist any time it changes, once the initial load is done
  // (so we never overwrite a saved wishlist with an empty array on start).
  useEffect(() => {
    if (!wishlistLoaded) return;
    (async () => {
      try {
        await window.storage.set("wishlist", JSON.stringify(saved), false);
      } catch (err) {
        console.error("Failed to save wishlist", err);
      }
    })();
  }, [saved, wishlistLoaded]);

  const toggleSaved = (p: Product) => {
    setSaved((s) => {
      const isSaved = s.includes(p.id);
      showToast(isSaved ? `${p.name} removed from wishlist` : `${p.name} added to wishlist`);
      return isSaved ? s.filter((x) => x !== p.id) : [...s, p.id];
    });
  };

  const items = cart.reduce((n, x) => n + x.quantity, 0);
  const nav = (p: Page) => {
    setPage(p);
    setMenu(false);
    scrollTo({ top: 0, behavior: "smooth" });
  };
  const add = (p: Product) => {
    setCart((c) =>
      c.some((x) => x.id === p.id)
        ? c.map((x) => (x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x))
        : [...c, { ...p, quantity: 1 }],
    );
    showToast(`${p.name} added to bag`);
  };

  // Creates a brand-new account. Fails if that email is already registered.
  const signUp = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const key = email.toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === key)) {
      return {
        ok: false,
        message: "An account with this Gmail address already exists. Try signing in instead.",
      };
    }
    const newUser: StoredUser = { email, name, password, joinedAt: new Date().toISOString() };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    try {
      await window.storage.set("users", JSON.stringify(nextUsers), false);
      await window.storage.set("session", JSON.stringify(email), false);
    } catch (err) {
      console.error("Failed to save new account", err);
    }
    setUser({ email, name, joinedAt: newUser.joinedAt });
    setOrders([]);
    return { ok: true, message: "Your account is ready. Welcome!" };
  };

  // Only succeeds if the email was signed up before and the password matches.
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const key = email.toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === key);
    if (!found) {
      return {
        ok: false,
        message: "We couldn't find an account with this Gmail address. Please sign up first.",
      };
    }
    if (found.password !== password) {
      return { ok: false, message: "That password doesn't match this account." };
    }
    try {
      await window.storage.set("session", JSON.stringify(found.email), false);
    } catch (err) {
      console.error("Failed to save session", err);
    }
    setUser({ email: found.email, name: found.name, joinedAt: found.joinedAt });
    let loadedOrders: Order[] = [];
    try {
      const res = await window.storage.get(`orders:${key}`, false);
      if (res) loadedOrders = JSON.parse(res.value);
    } catch {
      // no orders saved yet for this account
    }
    setOrders(loadedOrders);
    return { ok: true, message: "You're signed in. Welcome back!" };
  };

  const onLogout = async () => {
    setUser(null);
    setOrders([]);
    try {
      await window.storage.delete("session", false);
    } catch (err) {
      console.error("Failed to clear session", err);
    }
  };

  const placeOrder = async (address: Address, lines: CartLine[], total: number) => {
    const order: Order = {
      id: Date.now().toString(36).toUpperCase(),
      items: lines,
      address,
      total,
      placedAt: new Date().toISOString(),
    };
    const next = [...orders, order];
    setOrders(next);
    setCart([]);
    if (user) {
      try {
        await window.storage.set(`orders:${user.email.toLowerCase()}`, JSON.stringify(next), false);
      } catch (err) {
        console.error("Failed to save order", err);
      }
    }
    return order;
  };

  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === "All" || p.category === category) &&
            `${p.brand} ${p.name}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "price-low"
            ? a.price - b.price
            : sort === "price-high"
              ? b.price - a.price
              : sort === "rating"
                ? b.rating - a.rating
                : a.id - b.id,
        ),
    [category, query, sort],
  );
  const wishlistProducts = useMemo(
    () => saved.map((id) => productsById.get(id)).filter((p): p is Product => !!p),
    [saved],
  );
  const select = (c: string) => {
    setCategory(c);
    nav("shop");
    setTimeout(
      () =>
        document
          .getElementById("catalogue")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };
  return (
    <div className="app">
      <div className="offer">
        EXTRA 15% OFF ON YOUR FIRST ORDER <i>•</i> USE CODE: HELLO15
      </div>
      <header>
        <button className="brand" onClick={() => nav("shop")}>
          NEXUS<span>STYLE</span>
        </button>
        <nav className={menu ? "open" : ""}>
          {categories.slice(1).map((c) => (
            <button key={c} onClick={() => select(c)}>
              {c}
            </button>
          ))}
          <button onClick={() => select("All")}>New arrivals</button>
        </nav>
        <label className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              nav("shop");
            }}
            placeholder="Search for styles, brands and more"
          />
        </label>
        <div className="actions">
          <button className="hamb" onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
          <button onClick={() => nav("account")}>
            <UserRound />
            <small>{user ? user.name.split(" ")[0] : "Profile"}</small>
          </button>
          <button className="bag" onClick={() => nav("wishlist")}>
            <Heart fill={saved.length ? "currentColor" : "none"} />
            <small>Wishlist</small>
            {saved.length > 0 && <b>{saved.length}</b>}
          </button>
          <button className="bag" onClick={() => nav("cart")}>
            <ShoppingBag />
            <small>Bag</small>
            {items > 0 && <b>{items}</b>}
          </button>
        </div>
      </header>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
      {page === "shop" && (
        <Shop
          visible={visible}
          category={category}
          select={select}
          sort={sort}
          setSort={setSort}
          add={add}
          saved={saved}
          toggleSaved={toggleSaved}
        />
      )}{" "}
      {page === "cart" && (
        <Cart
          cart={cart}
          remove={(id) => setCart((c) => c.filter((x) => x.id !== id))}
          update={(id, n) =>
            setCart((c) =>
              c.flatMap((x) =>
                x.id !== id
                  ? [x]
                  : x.quantity + n > 0
                    ? [{ ...x, quantity: x.quantity + n }]
                    : [],
              ),
            )
          }
          shop={() => nav("shop")}
          onPlaceOrder={placeOrder}
          user={user}
        />
      )}{" "}
      {page === "wishlist" && (
        <Wishlist
          items={wishlistProducts}
          toggleSaved={toggleSaved}
          add={add}
          shop={() => nav("shop")}
        />
      )}{" "}
      {page === "account" && (
        <Account
          shop={() => nav("shop")}
          user={user}
          orders={orders}
          loading={loadingUser}
          onSignIn={signIn}
          onSignUp={signUp}
          onLogout={onLogout}
        />
      )}
      <footer>
        <div>
          <button className="brand" onClick={() => nav("shop")}>
            NEXUS<span>STYLE</span>
          </button>
          <p>Personal style, made easy.</p>
        </div>
        <div>
          <strong>CUSTOMER CARE</strong>
          <a href="mailto:hello@nexusstore.example">Contact us</a>
          <a href="#returns">Returns & exchanges</a>
        </div>
        <div>
          <strong>DOWNLOAD THE APP</strong>
          <p>Fresh drops and saved styles, wherever you are.</p>
        </div>
        <small>© 2026 NexusStyle. All rights reserved.</small>
      </footer>
      <ShopBot select={select} />
    </div>
  );
}

function Shop({
  visible,
  category,
  select,
  sort,
  setSort,
  add,
  saved,
  toggleSaved,
}: {
  visible: Product[];
  category: string;
  select: (c: string) => void;
  sort: string;
  setSort: (x: string) => void;
  add: (p: Product) => void;
  saved: number[];
  toggleSaved: (p: Product) => void;
}) {
  return (
    <main>
      <section className="hero">
        <img
          src="https://static.vecteezy.com/system/resources/previews/002/795/001/non_2x/special-offer-red-label-illustration-free-vector.jpg"
          alt="Offers on Samsung mobile phones"
        />
        <div>
          <p>When Shopping Meets Style</p>
          <h1>
            Shop the latest trends and deals
            <br />
            <em>Shopping Made Easy.</em>
          </h1>
          <span>Fresh looks, festive finds and great deals.</span>
          <button
            onClick={() =>
              document
                .getElementById("catalogue")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Diving into the catalogue
          </button>
        </div>
      </section>
      <section className="trust">
        <span>
          <PackageCheck />
          Free delivery on orders over ₹999
        </span>
        <span>
          <ShieldCheck />
          Easy 30-day returns
        </span>
        <span>
          <Star />
          Rated 4.7 by our community
        </span>
      </section>
      <section className="festivals">
        <button onClick={() => select("Accessories")}>
          <img
            src="https://media.istockphoto.com/id/1560030310/photo/happy-young-indian-girl-tying-rakhi-to-brother-hand-during-raksha-bandhan-festival-at-home.jpg?s=612x612&w=0&k=20&c=0QMI8x6AMBhR_gAJT1YaZG1Hht5Bk1zsvCm9ry7kKKY="
            alt="Rakhi celebration"
          />
          <div>
            <p>RAKHI SPECIAL</p>
            <h2>Gifts that say it beautiful.</h2>
            <span>Up to 60% off on celebration picks</span>
          </div>
        </button>
        <button onClick={() => select("Electronics")}>
          <img
            src="https://festivaltools.github.io/assets/images/festivals/ganesh-chaturthi/ganesh-chaturthi-2026.webp"
            alt="Ganesh Chaturthi offers"
          />
          <div>
            <p>GANESH CHATURTHI OFFERS</p>
            <h2>Bring home joyful upgrades.</h2>
            <span>Extra savings on electronics & mobiles</span>
          </div>
        </button>
      </section>
      <section className="moods">
        <div className="heading">
          <p>SHOP BY SECTIONS</p>
          <h2>Everything you love, in one place.</h2>
        </div>
        <div className="tiles">
          {departments.map((t) => (
            <button key={t} onClick={() => select(t)}>
              <img src={categoryImages[t]} alt="" />
              <div>
                <b>{t}</b>
                <span>Shop now</span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="catalogue" id="catalogue">
        <div className="catalogue-head">
          <div>
            <p>CURATED FOR YOU</p>
            <h2>{category === "All" ? "Trending now" : category}</h2>
          </div>
          <span>{visible.length.toLocaleString("en-IN")} products</span>
        </div>
        <div className="filters">
          <div>
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => select(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label>
            Sort by{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Recommended</option>
              <option value="rating">Customer rating</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
        <div className="products">
          {visible.map((p) => (
            <article className="product" key={p.id}>
              <div className="image">
                <img src={p.image} alt={p.name} />
                {p.badge && <span>{p.badge}</span>}
                <button
                  className={saved.includes(p.id) ? "saved" : ""}
                  aria-label={
                    saved.includes(p.id) ? "Remove from wishlist" : "Add to wishlist"
                  }
                  onClick={() => toggleSaved(p)}
                >
                  <Heart
                    fill={saved.includes(p.id) ? "currentColor" : "none"}
                  />
                </button>
                <div className="quick">
                  <button onClick={() => add(p)}>
                    <Plus size={16} />
                    Add to bag
                  </button>
                </div>
              </div>
              <div className="info">
                <b>{p.brand}</b>
                <p>{p.name}</p>
                <div>
                  <strong>{money(p.price)}</strong>
                  <s>{money(p.oldPrice)}</s>
                  <em>{Math.round((1 - p.price / p.oldPrice) * 100)}% off</em>
                </div>
                <small>
                  <Star size={11} fill="currentColor" />
                  {p.rating}
                </small>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && (
          <div className="empty">
            <Search size={40} />
            <h2>No products found</h2>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function Wishlist({
  items,
  toggleSaved,
  add,
  shop,
}: {
  items: Product[];
  toggleSaved: (p: Product) => void;
  add: (p: Product) => void;
  shop: () => void;
}) {
  return (
    <main className="page">
      <button className="back" onClick={shop}>
        <ArrowLeft size={17} />
        Continue shopping
      </button>
      <h1>Your wishlist</h1>
      {!items.length ? (
        <div className="empty">
          <Heart size={42} />
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on anything you love and it’ll show up here.</p>
          <button className="primary" onClick={shop}>
            Start shopping
          </button>
        </div>
      ) : (
        <div className="products">
          {items.map((p) => (
            <article className="product" key={p.id}>
              <div className="image">
                <img src={p.image} alt={p.name} />
                {p.badge && <span>{p.badge}</span>}
                <button
                  className="saved"
                  aria-label="Remove from wishlist"
                  onClick={() => toggleSaved(p)}
                >
                  <Heart fill="currentColor" />
                </button>
                <div className="quick">
                  <button onClick={() => add(p)}>
                    <Plus size={16} />
                    Add to bag
                  </button>
                </div>
              </div>
              <div className="info">
                <b>{p.brand}</b>
                <p>{p.name}</p>
                <div>
                  <strong>{money(p.price)}</strong>
                  <s>{money(p.oldPrice)}</s>
                  <em>{Math.round((1 - p.price / p.oldPrice) * 100)}% off</em>
                </div>
                <small>
                  <Star size={11} fill="currentColor" />
                  {p.rating}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function Cart({
  cart,
  remove,
  update,
  shop,
  onPlaceOrder,
  user,
}: {
  cart: CartLine[];
  remove: (id: number) => void;
  update: (id: number, n: number) => void;
  shop: () => void;
  onPlaceOrder: (address: Address, lines: CartLine[], total: number) => Promise<Order>;
  user: UserProfile | null;
}) {
  const [step, setStep] = useState<"bag" | "address" | "confirmed">("bag");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  const subtotal = cart.reduce((n, x) => n + x.price * x.quantity, 0),
    shipping = subtotal && subtotal < 999 ? 99 : 0,
    total = subtotal + shipping;

  const submitAddress = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const address: Address = {
      name: String(f.get("name") || ""),
      phone: String(f.get("phone") || ""),
      line1: String(f.get("line1") || ""),
      city: String(f.get("city") || ""),
      state: String(f.get("state") || ""),
      pincode: String(f.get("pincode") || ""),
    };
    setPlacing(true);
    const order = await onPlaceOrder(address, cart, total);
    setPlacing(false);
    setConfirmed(order);
    setStep("confirmed");
  };

  if (step === "confirmed" && confirmed) {
    return (
      <main className="page">
        <div className="empty">
          <PackageCheck size={44} />
          <h2>Order confirmed!</h2>
          <p>
            Order #{confirmed.id} will be delivered to {confirmed.address.name} at{" "}
            {confirmed.address.line1}, {confirmed.address.city}. No payment was taken —
            pay {money(confirmed.total)} in cash or by card when it arrives.
          </p>
          {!user && (
            <p className="hint">
              Sign in next time to see this order under your profile.
            </p>
          )}
          <button className="primary" onClick={shop}>
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <button
        className="back"
        onClick={() => (step === "address" ? setStep("bag") : shop())}
      >
        <ArrowLeft size={17} />
        {step === "address" ? "Back to bag" : "Continue shopping"}
      </button>
      <h1>{step === "address" ? "Delivery address" : "Shopping bag"}</h1>
      {!cart.length ? (
        <div className="empty">
          <ShoppingBag size={42} />
          <h2>Your bag is empty</h2>
          <p>Find something you’ll want to wear on repeat.</p>
          <button className="primary" onClick={shop}>
            Start shopping
          </button>
        </div>
      ) : step === "address" ? (
        <div className="cart">
          <form className="address-form" onSubmit={submitAddress}>
            <label>
              Full name
              <input
                name="name"
                defaultValue={user?.name || ""}
                required
                placeholder="Your name"
              />
            </label>
            <label>
              Phone number
              <input
                name="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
              />
            </label>
            <label>
              Address
              <input name="line1" required placeholder="House no., street, area" />
            </label>
            <div className="row">
              <label>
                City
                <input name="city" required placeholder="City" />
              </label>
              <label>
                State
                <input name="state" required placeholder="State" />
              </label>
            </div>
            <label>
              Pincode
              <input
                name="pincode"
                required
                pattern="[0-9]{6}"
                placeholder="6-digit pincode"
              />
            </label>
            <button className="primary" disabled={placing}>
              {placing ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Placing order…
                </>
              ) : (
                "Confirm order · No payment now"
              )}
            </button>
            <small>
              <ShieldCheck size={14} />
              Cash / card on delivery — nothing is charged when you confirm
            </small>
          </form>
          <aside>
            <h2>Price details</h2>
            <p>
              <span>Bag subtotal</span>
              <b>{money(subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>{shipping ? money(shipping) : "FREE"}</b>
            </p>
            <div className="total">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>
          </aside>
        </div>
      ) : (
        <div className="cart">
          <section>
            {cart.map((p) => (
              <article className="line" key={p.id}>
                <img src={p.image} alt="" />
                <div>
                  <b>{p.brand}</b>
                  <p>{p.name}</p>
                  <button className="remove" onClick={() => remove(p.id)}>
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
                <div>
                  <strong>{money(p.price * p.quantity)}</strong>
                  <span className="qty">
                    <button onClick={() => update(p.id, -1)}>
                      <Minus size={14} />
                    </button>
                    {p.quantity}
                    <button onClick={() => update(p.id, 1)}>
                      <Plus size={14} />
                    </button>
                  </span>
                </div>
              </article>
            ))}
          </section>
          <aside>
            <h2>Price details</h2>
            <p>
              <span>Bag subtotal</span>
              <b>{money(subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>{shipping ? money(shipping) : "FREE"}</b>
            </p>
            <div className="total">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>
            <button className="primary" onClick={() => setStep("address")}>
              Checkout
            </button>
            <small>
              <ShieldCheck size={14} />
              No payment required now — pay on delivery
            </small>
          </aside>
        </div>
      )}
    </main>
  );
}

function Account({
  shop,
  user,
  orders,
  loading,
  onSignIn,
  onSignUp,
  onLogout,
}: {
  shop: () => void;
  user: UserProfile | null;
  orders: Order[];
  loading: boolean;
  onSignIn: (email: string, password: string) => Promise<AuthResult>;
  onSignUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  onLogout: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin"),
    [msg, setMsg] = useState(""),
    [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form),
      email = String(f.get("email")),
      pass = String(f.get("password")),
      confirm = String(f.get("confirm") || ""),
      name = String(f.get("name") || "");
    if (!/^\S+@gmail\.com$/i.test(email))
      return setMsg("Please enter a valid Gmail address.");
    if (pass.length < 8) return setMsg("Password needs at least 8 characters.");
    if (mode === "signup" && pass !== confirm)
      return setMsg("Passwords don’t match yet.");
    if (mode === "signup" && !name.trim())
      return setMsg("Please tell us your name.");

    setSubmitting(true);
    const result =
      mode === "signup"
        ? await onSignUp(name.trim(), email, pass)
        : await onSignIn(email, pass);
    setSubmitting(false);
    setMsg(result.message);
    if (result.ok) form.reset();
  };

  if (loading) {
    return (
      <main className="account">
        <div className="empty">
          <Loader2 size={32} className="spin" />
          <p>Loading your account…</p>
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="account">
        <button className="back" onClick={shop}>
          <ArrowLeft size={17} />
          Back to shopping
        </button>
        <section className="profile-card">
          <div className="profile-head">
            <div className="avatar">
              <UserRound />
            </div>
            <div>
              <h1>{user.name}</h1>
              <span>{user.email}</span>
            </div>
            <button className="logout" onClick={onLogout}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
          <p className="joined">
            Member since{" "}
            {new Date(user.joinedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </section>
        <section className="orders">
          <h2>
            <Package size={18} />
            Your orders
          </h2>
          {!orders.length ? (
            <div className="empty small">
              <Package size={32} />
              <p>No orders yet. Once you place an order it’ll show up here.</p>
              <button className="primary" onClick={shop}>
                Start shopping
              </button>
            </div>
          ) : (
            <div className="order-list">
              {orders
                .slice()
                .reverse()
                .map((o) => (
                  <article key={o.id} className="order">
                    <header>
                      <div>
                        <b>Order #{o.id}</b>
                        <small>
                          {new Date(o.placedAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </small>
                      </div>
                      <strong>{money(o.total)}</strong>
                    </header>
                    <div className="order-items">
                      {o.items.map((it) => (
                        <span key={it.id}>
                          {it.name} × {it.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="order-address">
                      <MapPin size={13} />
                      {o.address.line1}, {o.address.city}, {o.address.state} -{" "}
                      {o.address.pincode}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="account">
      <button className="back" onClick={shop}>
        <ArrowLeft size={17} />
        Back to shopping
      </button>
      <section>
        <p>YOUR NEXUSSTYLE ACCOUNT</p>
        <h1>
          {mode === "signin" ? "Hi, good to see you." : "Let’s get you styled."}
        </h1>
        <span>
          {mode === "signin"
            ? "Sign in to see your saved styles and bag."
            : "Create an account to save your favourites."}
        </span>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Full name
              <input name="name" type="text" placeholder="Your name" required />
            </label>
          )}
          <label>
            Gmail address
            <input
              name="email"
              type="email"
              placeholder="you@gmail.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
            />
          </label>
          {mode === "signup" && (
            <label>
              Re-enter password
              <input
                name="confirm"
                type="password"
                placeholder="Repeat your password"
                required
              />
            </label>
          )}
          {msg && (
            <p className={msg.startsWith("You") || msg.startsWith("Your") ? "success" : "error"}>
              {msg}
            </p>
          )}
          <button className="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin" />
                Please wait…
              </>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>
        <div>
          {mode === "signin"
            ? "New to NexusStyle?"
            : "Already have an account?"}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setMsg("");
            }}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}

function ShopBot({ select }: { select: (category: string) => void }) {
  const [open, setOpen] = useState(false),
    [input, setInput] = useState(""),
    [reply, setReply] = useState(
      "Tell me what you’re shopping for — a budget, occasion, brand or category all work.",
    );
  const ask = () => {
    const q = input.toLowerCase();
    if (!q.trim()) return;
    const match = departments.find(
      (d) =>
        q.includes(d.toLowerCase().replace("'s ", " ")) ||
        q.includes(d.toLowerCase().split(" ")[0]),
    );
    const inferred =
      q.includes("phone") || q.includes("mobile")
        ? "Mobiles"
        : q.includes("laptop") ||
            q.includes("headphone") ||
            q.includes("electronic")
          ? "Electronics"
          : q.includes("women") || q.includes("dress")
            ? "Women's wear"
            : q.includes("men") || q.includes("shirt")
              ? "Men's wear"
              : q.includes("kid") || q.includes("child")
                ? "Kids wear"
                : q.includes("shoe") || q.includes("sneaker")
                  ? "Footwear"
                  : match;
    if (inferred) {
      setReply(
        `Great choice! I’ve opened ${inferred}. Use the filters to compare popular picks.`,
      );
      select(inferred);
    } else
      setReply(
        "I can help with Mobiles, Electronics, Men’s wear, Women’s wear, Kids wear, Accessories and Footwear. Try: ‘phone under ₹20,000’ or ‘Rakhi gift ideas’.",
      );
    setInput("");
  };
  return (
    <div className="bot">
      <button
        className="bot-launch"
        onClick={() => setOpen(!open)}
        aria-label="Open shopping assistant"
      >
        {open ? <X /> : <Bot />}
        <span>Style assistant</span>
      </button>
      {open && (
        <section>
          <header>
            <Bot />
            <div>
              <b>Nexus assistant</b>
              <small>Online · shopping help</small>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={17} />
            </button>
          </header>
          <div className="bot-copy">
            <p>{reply}</p>
            <div>
              <button
                onClick={() => {
                  setInput("Rakhi gift ideas");
                }}
              >
                Rakhi gifts
              </button>
              <button
                onClick={() => {
                  setInput("mobile phones");
                }}
              >
                Find mobiles
              </button>
              <button
                onClick={() => {
                  setInput("women dress");
                }}
              >
                Women’s fashion
              </button>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recommendation..."
            />
            <button>
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
