import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/shell";
import { formatCad } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Cart · Dayo Styles" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { lang } = useLang();
  const { items, total, setQty, remove, ready } = useCart();
  const fr = lang === "fr";

  return (
    <div className="bg-background">
      <PageHero
        eyebrow={fr ? "Panier" : "Cart"}
        title={fr ? "Votre panier" : "Your Cart"}
        subtitle={fr ? "Vérifiez les produits choisis" : "Review your selected products"}
        tone="soft"
      />
      <section className="section-spacing container mx-auto px-6">
        {!ready ? null : items.length === 0 ? (
          <div className="mx-auto max-w-lg border border-primary/15 px-8 py-16 text-center">
            <h2 className="mb-3 font-editorial text-3xl italic text-ink-700">{fr ? "Votre panier est vide" : "Your cart is empty"}</h2>
            <p className="mb-8 font-body text-sm text-ink-500">
              {fr ? "Vous n'avez pas encore ajouté de produits." : "Looks like you haven't added any products yet."}
            </p>
            <Link to="/shop" className="inline-flex h-12 items-center bg-primary px-8 font-body text-xs uppercase tracking-widest text-primary-foreground">
              {fr ? "Voir les produits" : "Browse Products"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <ul className="divide-y divide-primary/10 border border-primary/10">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 sm:gap-6 sm:p-6">
                  <img src={item.image} alt="" className="h-32 w-24 shrink-0 bg-secondary/30 object-cover object-center" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-editorial text-xl italic text-ink-700">{item.name}</h3>
                    <p className="mt-1 font-body text-sm text-primary">{formatCad(item.price)}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <button type="button" aria-label="Decrease" onClick={() => setQty(item.id, item.qty - 1)} className="h-8 w-8 border border-primary/30 text-ink-700">
                        −
                      </button>
                      <span className="min-w-6 text-center font-body text-sm">{item.qty}</span>
                      <button type="button" aria-label="Increase" onClick={() => setQty(item.id, item.qty + 1)} className="h-8 w-8 border border-primary/30 text-ink-700">
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => remove(item.id)} className="mt-3 font-body text-[11px] uppercase tracking-widest text-ink-400 hover:text-primary">
                      {fr ? "Retirer" : "Remove"}
                    </button>
                  </div>
                  <p className="font-headline text-sm text-ink-700">{formatCad(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>
            <aside className="h-fit border border-primary/15 bg-secondary/20 p-6">
              <h2 className="mb-6 font-headline text-xs uppercase tracking-crown">{fr ? "Sommaire" : "Order Summary"}</h2>
              <div className="space-y-3 font-body text-sm text-ink-600">
                <div className="flex justify-between">
                  <span>{fr ? "Sous-total" : "Subtotal"}</span>
                  <span>{formatCad(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{fr ? "Livraison" : "Shipping"}</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between border-t border-primary/20 pt-3 font-headline text-ink-800">
                  <span>{fr ? "Total" : "Total"}</span>
                  <span>{formatCad(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 inline-flex h-12 w-full items-center justify-center bg-primary font-body text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                {fr ? "Passer au paiement" : "Proceed to Checkout"}
              </Link>
              <Link to="/shop" className="mt-3 inline-flex h-12 w-full items-center justify-center border border-ink-800 font-body text-xs uppercase tracking-widest text-ink-800">
                {fr ? "Continuer vos achats" : "Continue Shopping"}
              </Link>
              <p className="mt-4 text-center font-body text-[11px] text-ink-400">{fr ? "Paiement sécurisé" : "Secure checkout"}</p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
