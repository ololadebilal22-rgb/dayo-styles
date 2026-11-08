export type ShopCategory = "wigs" | "extensions" | "care" | "accessories";

export type Product = {
  id: number;
  name: string;
  category: ShopCategory;
  price: number;
  badge: string | null;
  image: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Italian Curls M35",
    category: "wigs",
    price: 10.99,
    badge: "Bestseller",
    image: "/shop/french-curls-1.jpeg",
    description: "Bulk M35 – rich brown curly bulk hair",
  },
  {
    id: 2,
    name: "Italian Curls Bulk SP12/16/613",
    category: "wigs",
    price: 10.99,
    badge: "New",
    image: "/shop/french-curls-2.jpeg",
    description: "Blonde mix bulk – SP12/16/613",
  },
  {
    id: 3,
    name: "Italian Curls 1B",
    category: "wigs",
    price: 10.99,
    badge: null,
    image: "/shop/french-curls-3.jpeg",
    description: "Natural black 1B curly bulk",
  },
  {
    id: 4,
    name: "Italian Curls C14",
    category: "extensions",
    price: 10.99,
    badge: "Popular",
    image: "/shop/french-curls-4.jpeg",
    description: "Ombre black to blonde C14",
  },
  {
    id: 5,
    name: "Italian Curls 27#",
    category: "extensions",
    price: 10.99,
    badge: null,
    image: "/shop/french-curls-5.jpeg",
    description: "Honey blonde 27# straight bulk",
  },
  {
    id: 6,
    name: "Italian Curls 24#",
    category: "extensions",
    price: 10.99,
    badge: null,
    image: "/shop/french-curls-6.jpeg",
    description: "Light blonde 24# straight bulk",
  },
  {
    id: 7,
    name: "French Curls P27/33#",
    category: "care",
    price: 10.99,
    badge: "Bestseller",
    image: "/shop/italian-curls-1.jpeg",
    description: "Two-tone brown/blonde French curls",
  },
  {
    id: 8,
    name: "French Curls 33#",
    category: "care",
    price: 10.99,
    badge: null,
    image: "/shop/italian-curls-2.jpeg",
    description: "Deep auburn brown 33# French curls",
  },
  {
    id: 9,
    name: "French Curls BUG#",
    category: "accessories",
    price: 10.99,
    badge: "New",
    image: "/shop/italian-curls-3.jpeg",
    description: "Burgundy BUG# French curls",
  },
  {
    id: 10,
    name: "French Curls 4#",
    category: "care",
    price: 10.99,
    badge: null,
    image: "/shop/italian-curls-4.jpeg",
    description: "Dark chocolate 4# French curls",
  },
  {
    id: 11,
    name: "French Curls TBUG#",
    category: "accessories",
    price: 10.99,
    badge: null,
    image: "/shop/italian-curls-5.jpeg",
    description: "Black to burgundy TBUG# French curls",
  },
  {
    id: 12,
    name: "French Curls Premium",
    category: "care",
    price: 10.99,
    badge: null,
    image: "/shop/italian-curls-6.jpeg",
    description: "Premium French curls bulk",
  },
];

export const shopCategories = [
  { value: "all", en: "All Products", fr: "Tous les produits" },
  { value: "wigs", en: "Wigs / Bulk", fr: "Perruques / Vrac" },
  { value: "extensions", en: "Extensions", fr: "Extensions" },
  { value: "care", en: "French Curls", fr: "French Curls" },
  { value: "accessories", en: "Accessories", fr: "Accessoires" },
] as const;

export function formatCad(amount: number) {
  return (
    "$" +
    amount.toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}
