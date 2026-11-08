import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { PageHero } from "@/components/shell";
import { formatCad } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";

const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Secure Checkout · Dayo Styles" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lang } = useLang();
  const { items, total, ready } = useCart();
  const fr = lang === "fr";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cancelled") === "1";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!items.length) {
      setError(fr ? "Votre panier est vide." : "Your cart is empty.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const customer = {
      fullName: String(data.get("fullname") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      province: String(data.get("province") ?? "").trim(),
      postal: String(data.get("postal") ?? "").trim(),
    };
    if (Object.values(customer).some((value) => !value)) {
      setError(fr ? "Veuillez remplir tous les champs." : "Please complete all delivery details.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items: items.map((item) => ({ id: item.id, qty: item.qty })) }),
      });
      const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !result.url)
        throw new Error(
          result.error ||
            (fr
              ? "Le paiement sécurisé n'a pas pu démarrer. Veuillez réessayer."
              : `Secure checkout could not be started (server responded ${response.status}). Please try again.`),
        );
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Secure checkout could not be started.");
      setLoading(false);
    }
  }

  if (ready && items.length === 0) {
    return <div className="section-spacing container mx-auto px-6 text-center"><p className="mb-6 font-editorial text-2xl italic text-ink-600">{fr ? "Votre panier est vide." : "Your cart is empty."}</p><Link to="/shop" className="inline-flex h-12 items-center bg-primary px-8 font-body text-xs uppercase tracking-widest text-primary-foreground">{fr ? "Boutique" : "Shop Hair Products"}</Link></div>;
  }

  return (
    <div className="bg-background">
      <PageHero eyebrow="Secure Checkout" title={fr ? "Paiement sécurisé" : "Secure checkout"} subtitle={fr ? "Votre commande sera confirmée après paiement." : "Your order is only confirmed after Stripe verifies payment."} tone="soft" />
      <section className="section-spacing container mx-auto px-6">
        {cancelled && <p className="mx-auto mb-6 max-w-3xl border border-primary/20 bg-secondary/30 p-4 font-body text-sm text-ink-600">{fr ? "Le paiement a été annulé. Aucun paiement n'a été confirmé; vous pouvez réessayer." : "Your payment was cancelled. No payment has been confirmed, and your cart is still saved. You can try again."}</p>}
        <form onSubmit={onSubmit} className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="border border-primary/10 bg-paper p-6 sm:p-8">
            <h2 className="mb-6 font-headline text-xs uppercase tracking-crown">{fr ? "Coordonnées de livraison" : "Delivery details"}</h2>
            <Field label={fr ? "Nom complet *" : "Full name *"} name="fullname" required placeholder={fr ? "Votre nom" : "Your full name"} />
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Email *" name="email" type="email" required placeholder="you@example.com" /><Field label={fr ? "Téléphone *" : "Phone *"} name="phone" type="tel" required placeholder="+1 (416) 000-0000" /></div>
            <Field label={fr ? "Adresse *" : "Street address *"} name="address" required placeholder="123 Main Street, Apt 4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={fr ? "Ville *" : "City *"} name="city" required placeholder="Toronto" />
              <label className="mb-4 block font-body text-xs text-ink-600">{fr ? "Province *" : "Province *"}<select name="province" required className="mt-2 h-11 w-full border border-primary/20 bg-background px-3 text-sm" defaultValue="ON"><option value="">{fr ? "Choisir" : "Select province"}</option>{PROVINCES.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
            </div>
            <Field label={fr ? "Code postal *" : "Postal code *"} name="postal" required placeholder="M5V 2T6" />
            <div className="mt-5 flex items-start gap-3 border border-primary/15 bg-secondary/20 p-4"><LockKeyhole size={19} className="mt-0.5 shrink-0 text-primary" /><p className="font-body text-xs leading-relaxed text-ink-600">{fr ? "Le paiement est traité sur la page sécurisée de Stripe. Les commandes ne sont confirmées qu'après vérification du paiement." : "Card payments and supported digital wallets are processed on Stripe’s secure checkout page. An order is confirmed only after the server verifies payment."}</p></div>
            {error && <p role="alert" className="mt-4 font-body text-sm text-maison-berry">{error}</p>}
            <button type="submit" disabled={loading || !ready || items.length === 0} className="mt-6 inline-flex h-14 w-full items-center justify-center bg-primary px-6 font-body text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? (fr ? "Ouverture du paiement sécurisé…" : "Opening secure checkout…") : `${fr ? "Payer maintenant" : "Continue to payment"} · ${formatCad(total)} CAD`}</button>
          </div>
          <aside className="h-fit border border-primary/15 bg-secondary/20 p-6">
            <h2 className="mb-4 font-headline text-xs uppercase tracking-crown">{fr ? "Sommaire" : "Order summary"}</h2>
            <ul className="space-y-3 font-body text-sm text-ink-600">{items.map((item) => <li key={item.id} className="flex justify-between gap-3"><span>{item.name} × {item.qty}</span><span>{formatCad(item.price * item.qty)}</span></li>)}</ul>
            <div className="mt-4 space-y-2 border-t border-primary/15 pt-4 font-body text-sm"><div className="flex justify-between"><span>{fr ? "Sous-total" : "Subtotal"}</span><span>{formatCad(total)}</span></div><div className="flex justify-between"><span>{fr ? "Livraison" : "Shipping"}</span><span>{fr ? "À confirmer" : "Confirmed before dispatch"}</span></div><div className="flex justify-between font-headline text-ink-800"><span>{fr ? "Total produits" : "Product total"}</span><span>{formatCad(total)} CAD</span></div></div>
            <p className="mt-5 font-body text-[11px] leading-relaxed text-ink-400">{fr ? "La commande reste en attente jusqu'à la confirmation Stripe." : "Your order remains pending until Stripe confirms payment. Never share your card details with the salon by email or message."}</p>
          </aside>
        </form>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="mb-4 block font-body text-xs text-ink-600">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 h-11 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800 outline-none focus:border-primary" /></label>;
}
