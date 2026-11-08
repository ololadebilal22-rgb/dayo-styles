import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products } from "@/data/products";

const CART_KEY = "dayostyles_cart";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  toast: string | null;
  ready: boolean;
  add: (productId: number, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "number" && item.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);

  const add = useCallback(
    (productId: number, qty = 1) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return;
      setItems((current) => {
        const existing = current.find((item) => item.id === productId);
        if (existing) {
          return current.map((item) => (item.id === productId ? { ...item, qty: item.qty + qty } : item));
        }
        return [...current, { id: product.id, name: product.name, price: product.price, image: product.image, qty }];
      });
      const fr = document.documentElement.lang === "fr";
      notify(fr ? `${product.name} ajouté au panier` : `${product.name} added to cart`);
    },
    [notify],
  );

  const remove = useCallback(
    (productId: number) => {
      setItems((current) => current.filter((item) => item.id !== productId));
      const fr = document.documentElement.lang === "fr";
      notify(fr ? "Article retiré du panier" : "Item removed from cart");
    },
    [notify],
  );

  const setQty = useCallback(
    (productId: number, qty: number) => {
      if (qty <= 0) {
        remove(productId);
        return;
      }
      setItems((current) => current.map((item) => (item.id === productId ? { ...item, qty } : item)));
    },
    [remove],
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return { items, count, total, toast, ready, add, remove, setQty, clear };
  }, [items, toast, ready, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used in CartProvider");
  return value;
}
