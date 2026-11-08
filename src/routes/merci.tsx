import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/shell";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";

type Search = { session_id?: string };
type StatusResult = { paid?: boolean; type?: string | null; status?: string; error?: string };

export const Route = createFileRoute("/merci")({
  validateSearch: (search: Record<string, unknown>): Search => ({ session_id: typeof search.session_id === "string" ? search.session_id : undefined }),
  head: () => ({ meta: [{ title: "Order Payment Status · Dayo Styles" }] }),
  component: MerciPage,
});

function MerciPage() {
  const { t } = useLang();
  const { session_id: sessionId } = Route.useSearch();
  const { clear } = useCart();
  const [state, setState] = useState<"checking" | "paid" | "pending" | "error">("checking");
  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    let active = true;
    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as StatusResult;
        if (!response.ok) throw new Error(result.error || "Payment status could not be checked.");
        if (!active) return;
        if (result.paid && result.type === "shop") {
          setState("paid");
          clear();
        } else setState("pending");
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [sessionId, clear]);
  const paid = state === "paid";
  const subtitle = paid
    ? (t.thankYou.subtitle || "Your payment has been confirmed.")
    : state === "checking"
      ? "We’re securely verifying your payment with Stripe."
      : state === "pending"
        ? "Stripe has not yet confirmed this order. Do not place another order; contact us if you have been charged."
        : "We could not verify a paid order for this link. No order confirmation has been issued.";
  return (
    <div className="flex flex-col">
      <PageHero eyebrow={paid ? "Payment confirmed" : "Payment status"} title={paid ? "Thank you for your order" : state === "checking" ? "Checking your payment" : "Order not yet confirmed"} subtitle={subtitle} />
      <section className="section-spacing container mx-auto max-w-2xl px-6 text-center">
        <p className="mb-10 font-body text-base leading-relaxed text-ink-600">{paid ? "Your payment has been verified by our server. Your order is now marked as paid and can be prepared for dispatch." : "Only a verified successful Stripe payment can confirm an order. If you completed payment, keep your receipt and contact the salon if this page does not update."}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/" className="inline-flex h-14 items-center justify-center bg-ink-800 px-10 font-headline text-[11px] uppercase tracking-crown text-primary-foreground transition-colors hover:bg-primary">{t.thankYou.backHome}</Link>
          <Link to="/shop" className="inline-flex h-14 items-center justify-center border border-ink-800 px-10 font-headline text-[11px] uppercase tracking-crown text-ink-800 transition-colors hover:bg-ink-800 hover:text-primary-foreground">Continue shopping</Link>
        </div>
      </section>
    </div>
  );
}
