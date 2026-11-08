import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/shell";
import { formatCad, products, shopCategories } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [{ title: "Shop Hair Products · Dayo Styles" }, { name: "description", content: "Premium curls, extensions and hair essentials from DayoStyles." }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { lang } = useLang();
  const { add } = useCart();
  const [category, setCategory] = useState<string>("all");
  const fr = lang === "fr";
  const visible = useMemo(
    () => (category === "all" ? products : products.filter((product) => product.category === category)),
    [category],
  );

  return (
    <div className="bg-background">
      <PageHero
        eyebrow={fr ? "Boutique" : "Shop"}
        title={fr ? "Cheveux de luxe" : "Shop Luxury Hair"}
        subtitle={fr ? "Boucles, extensions et essentiels capillaires" : "Premium curls, extensions & hair essentials"}
        tone="soft"
      />
      <section className="section-spacing container mx-auto px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="border border-primary/15 bg-secondary/20 p-6 lg:sticky lg:top-28 lg:self-start">
            <h2 className="mb-5 font-headline text-[10px] uppercase tracking-crown text-ink-700">{fr ? "Filtrer" : "Filter by"}</h2>
            <p className="mb-3 font-body text-[10px] uppercase tracking-widest text-ink-400">{fr ? "Catégorie" : "Category"}</p>
            <div className="flex flex-col gap-3">
              {shopCategories.map((item) => (
                <label key={item.value} className="flex cursor-pointer items-center gap-2 font-body text-sm text-ink-600">
                  <input
                    type="radio"
                    name="category"
                    value={item.value}
                    checked={category === item.value}
                    onChange={() => setCategory(item.value)}
                    className="accent-[hsl(43_69%_36%)]"
                  />
                  {fr ? item.fr : item.en}
                </label>
              ))}
            </div>
            <p className="mt-6 border-t border-primary/15 pt-5 font-body text-xs text-ink-400">
              {fr ? "Livraison calculée au paiement" : "Shipping calculated at checkout"}
            </p>
          </aside>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.length === 0 ? (
              <p className="col-span-full py-16 text-center font-editorial text-xl italic text-ink-400">
                {fr ? "Aucun produit dans cette catégorie." : "No products found in this category."}
              </p>
            ) : (
              visible.map((product) => (
                <article key={product.id} className="flex flex-col border border-primary/10 bg-paper">
                  <div className="relative aspect-[4/5] bg-secondary/30">
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-ink-800 px-2 py-1 font-body text-[10px] uppercase tracking-widest text-maison-cream">
                        {product.badge}
                      </span>
                    )}
                    <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="cinzel-label mb-2 text-[10px]">{fr ? shopCategories.find((item) => item.value === product.category)?.fr : product.category}</span>
                    <h3 className="font-editorial text-2xl italic text-ink-700">{product.name}</h3>
                    <p className="mt-2 font-body text-sm text-ink-500">{product.description}</p>
                    <p className="mt-4 font-headline text-lg text-primary">{formatCad(product.price)}</p>
                    <button
                      type="button"
                      onClick={() => add(product.id)}
                      className="mt-5 inline-flex h-11 items-center justify-center bg-primary px-4 font-body text-[11px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
                    >
                      {fr ? "Ajouter au panier" : "Add to Cart"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
