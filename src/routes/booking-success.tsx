import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import { PageHero } from "@/components/shell";

type Search = { session_id?: string };
type StatusResult = { paid?: boolean; type?: string | null; service?: string; date?: string; time?: string; status?: string; error?: string };

export const Route = createFileRoute("/booking-success")({
  validateSearch: (search: Record<string, unknown>): Search => ({ session_id: typeof search.session_id === "string" ? search.session_id : undefined }),
  head: () => ({ meta: [{ title: "Appointment Payment Status · Dayo Styles" }] }),
  component: BookingSuccessPage,
});

function BookingSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!sessionId) { setError("No Stripe checkout session was provided, so no appointment can be confirmed."); return; }
    let active = true;
    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      .then(async (response) => {
        const json = (await response.json()) as StatusResult;
        if (!response.ok) throw new Error(json.error || "We could not check the payment yet.");
        if (active) setResult(json);
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "We could not check the payment yet."); });
    return () => { active = false; };
  }, [sessionId]);
  const paid = result?.paid === true && result.type === "booking";
  const checking = !result && !error;
  const title = paid ? "Your appointment is confirmed" : checking ? "Verifying your payment" : "Appointment not yet confirmed";
  const subtitle = paid ? "Stripe has verified your deposit. Your booking is confirmed." : checking ? "We’re checking the payment directly with Stripe." : "A booking is only confirmed after payment has been verified.";
  return (
    <div className="flex flex-col">
      <PageHero eyebrow={paid ? "Booking confirmed" : "Payment status"} title={title} subtitle={subtitle} />
      <section className="section-spacing container mx-auto max-w-2xl px-6 text-center">
        {paid ? (
          <div className="border border-primary/20 bg-paper p-8"><CheckCircle2 className="mx-auto mb-4 text-primary" size={40} /><h2 className="mb-4 font-editorial text-2xl italic text-ink-700">Thank you for booking Dayo Styles</h2><p className="font-body text-sm text-ink-600">{result.service}</p><p className="mt-2 font-body text-sm text-ink-600">{result.date} · {result.time}</p><p className="mt-4 font-body text-xs leading-relaxed text-ink-500">Your deposit was verified. Please keep your Stripe receipt. Any remaining service balance is due at the appointment.</p></div>
        ) : (
          <div className="border border-primary/20 bg-secondary/20 p-7"><Clock3 className="mx-auto mb-4 text-primary" size={36} /><p className="font-body text-sm leading-relaxed text-ink-600">{error || "We have not received confirmation of a paid deposit. Your appointment is not confirmed yet. If you were charged, keep your receipt and contact the salon before trying to pay again."}</p></div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"><Link to="/" className="inline-flex h-12 items-center justify-center bg-ink-800 px-8 font-headline text-[11px] uppercase tracking-crown text-primary-foreground">Back home</Link><Link to="/reservation" className="inline-flex h-12 items-center justify-center border border-ink-800 px-8 font-headline text-[11px] uppercase tracking-crown text-ink-800">Book another appointment</Link></div>
      </section>
    </div>
  );
}
