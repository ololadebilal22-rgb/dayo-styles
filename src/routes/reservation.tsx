import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ContactRow, PageHero, SizeGuide } from "@/components/shell";
import { useLang } from "@/lib/lang";
import { depositRate, site, styleBySlug, styles } from "@/lib/salon";
import { formatCad } from "@/data/products";

type Search = { service?: string; size?: string; payment?: string };
const TIME_LABELS: Record<string, string> = {
  "09:00": "9:00 AM",
  "10:00": "10:00 AM",
  "11:00": "11:00 AM",
  "12:00": "12:00 PM",
  "13:00": "1:00 PM",
};
const BOOKABLE_STYLES = styles.filter((style) => !style.quote && !style.contactOnly);

export const Route = createFileRoute("/reservation")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    service: typeof search.service === "string" ? search.service : undefined,
    size: typeof search.size === "string" ? search.size : undefined,
    payment: typeof search.payment === "string" ? search.payment : undefined,
  }),
  head: () => ({ meta: [{ title: "Book an Appointment · Dayo Styles Toronto" }] }),
  component: ReservationPage,
});

function ReservationPage() {
  const { service, size, payment } = Route.useSearch();
  const { t } = useLang();
  const current = styleBySlug(service);
  const isQuoteOnly = Boolean(current?.quote || current?.contactOnly);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHero eyebrow={t.reservation.eyebrow} title={t.reservation.title} subtitle={t.reservation.subtitle} />
      <section className="section-spacing container mx-auto px-6">
        <div className="mx-auto max-w-4xl">
          {payment === "cancelled" && (
            <p className="mb-6 border border-primary/20 bg-secondary/30 p-4 text-center font-body text-sm text-ink-600">
              Your payment was cancelled. No appointment has been confirmed; you can choose another time below.
            </p>
          )}
          {isQuoteOnly ? (
            <div className="mx-auto max-w-2xl border border-primary/20 bg-primary/5 p-8 text-center">
              <span className="cinzel-label mb-3 block">Custom booking</span>
              <h2 className="mb-3 font-editorial text-3xl italic text-ink-700">{current?.name}</h2>
              <p className="mb-6 font-body text-sm leading-relaxed text-ink-600">
                This style needs a personalized quote before payment. Contact Dayo Styles to confirm the price and appointment details.
              </p>
              <ContactRow />
              <Link to="/catalogue" className="mt-8 inline-flex border border-primary px-6 py-3 font-body text-xs uppercase tracking-widest text-primary">
                Browse hairstyles
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <span className="cinzel-label mb-2 block">Secure online booking</span>
                <h2 className="mb-3 font-headline text-2xl uppercase tracking-crown md:text-3xl">Reserve your appointment</h2>
                <p className="mx-auto max-w-2xl font-body text-sm leading-relaxed text-ink-500">
                  Choose your hairstyle and appointment time, then pay the required 35% deposit through Stripe. Your appointment is confirmed only after Stripe verifies payment.
                </p>
              </div>
              <ConsentGate>
                <BookingForm initialService={current && !isQuoteOnly ? current.slug : service} initialSize={size} />
              </ConsentGate>
            </>
          )}
          <div className="mt-12 border-l-4 border-maison-berry bg-maison-berry/5 p-6">
            <p className="mb-4 font-body text-xs leading-relaxed text-maison-berry">{t.reservation.depositNote}</p>
            <ContactRow className="sm:justify-start" />
          </div>
          <p className="sr-only">{site.email}</p>
        </div>
      </section>
    </div>
  );
}

function BookingForm({ initialService, initialSize }: { initialService?: string; initialSize?: string }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const firstService = BOOKABLE_STYLES.find((style) => style.slug === initialService) ?? BOOKABLE_STYLES[0];
  const initialSizeKey = firstService?.sizes.find((item) => item.label.en === initialSize || item.label.fr === initialSize)?.label.en ?? firstService?.sizes[0]?.label.en ?? "";
  const [serviceSlug, setServiceSlug] = useState(firstService?.slug ?? "");
  const selectedStyle = useMemo(() => BOOKABLE_STYLES.find((style) => style.slug === serviceSlug) ?? BOOKABLE_STYLES[0], [serviceSlug]);
  const [size, setSize] = useState(initialSizeKey);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(5);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentSize = selectedStyle?.sizes.find((item) => item.label.en === size) ?? selectedStyle?.sizes[0];
  const serviceAmount = Number(currentSize?.price ?? 0);
  const depositAmount = Math.round(serviceAmount * 100 * depositRate) / 100;

  useEffect(() => {
    if (!selectedStyle?.sizes.some((item) => item.label.en === size)) setSize(selectedStyle?.sizes[0]?.label.en ?? "");
  }, [selectedStyle, size]);

  useEffect(() => {
    if (!date) {
      setAvailableTimes([]);
      setTime("");
      setAvailabilityError("");
      return;
    }
    const controller = new AbortController();
    setAvailabilityLoading(true);
    setAvailabilityError("");
    setTime("");
    fetch(`/api/stripe/availability?date=${encodeURIComponent(date)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as { times?: string[]; remaining?: number; error?: string };
        if (!response.ok) throw new Error(result.error || "Availability could not be checked.");
        setAvailableTimes(result.times ?? []);
        setRemaining(result.remaining ?? 0);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setAvailableTimes([]);
        setRemaining(0);
        setAvailabilityError(err instanceof Error ? err.message : "Availability could not be checked.");
      })
      .finally(() => setAvailabilityLoading(false));
    return () => controller.abort();
  }, [date]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!date || !time || !serviceSlug || !size) {
      setError(fr ? "Veuillez choisir la coiffure, la date et l'heure." : "Choose a hairstyle, date, and time.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/booking-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          size,
          date,
          time,
          fullName: String(formData.get("fullName") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
        }),
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

  const minDate = (() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const tomorrow = new Date(`${today}T12:00:00Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  })();

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
      <div className="border border-primary/15 bg-paper p-6 sm:p-8">
        <h3 className="mb-6 font-headline text-xs uppercase tracking-crown">{fr ? "Détails du rendez-vous" : "Appointment details"}</h3>
        <label className="mb-5 block font-body text-xs text-ink-600">
          {fr ? "Coiffure *" : "Hairstyle *"}
          <select value={serviceSlug} onChange={(event) => { setServiceSlug(event.target.value); const next = BOOKABLE_STYLES.find((style) => style.slug === event.target.value); setSize(next?.sizes[0]?.label.en ?? ""); }} required className="mt-2 h-12 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800">
            {BOOKABLE_STYLES.map((style) => <option key={style.slug} value={style.slug}>{style.name}</option>)}
          </select>
        </label>
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block font-body text-xs text-ink-600">
            {fr ? "Taille / option *" : "Size / style option *"}
            <select value={currentSize?.label.en ?? size} onChange={(event) => setSize(event.target.value)} required className="mt-2 h-12 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800">
              {(selectedStyle?.sizes ?? []).map((item) => <option key={item.label.en} value={item.label.en}>{item.label[lang]} · {formatCad(item.price)} · {item.duration}</option>)}
            </select>
          </label>
          <label className="block font-body text-xs text-ink-600">
            {fr ? "Date du rendez-vous *" : "Appointment date *"}
            <input type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} required className="mt-2 h-12 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800" />
          </label>
        </div>
        <label className="mb-5 block font-body text-xs text-ink-600">
          {fr ? "Heure disponible *" : "Available time *"}
          <select value={time} onChange={(event) => setTime(event.target.value)} required disabled={!date || availabilityLoading || availableTimes.length === 0} className="mt-2 h-12 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800 disabled:opacity-60">
            <option value="">{availabilityLoading ? "Checking times…" : date ? "Select an available time" : "Choose a date first"}</option>
            {availableTimes.map((item) => <option key={item} value={item}>{TIME_LABELS[item] ?? item}</option>)}
          </select>
          {date && !availabilityLoading && !availabilityError && <span className="mt-2 block text-[11px] text-ink-400">{remaining === 0 ? "This date is fully booked." : `${remaining} of 5 daily appointments remaining.`}</span>}
          {availabilityError && <span className="mt-2 block text-[11px] text-maison-berry">{availabilityError}</span>}
        </label>
        <div className="my-7 border-t border-primary/10 pt-6">
          <h3 className="mb-5 font-headline text-xs uppercase tracking-crown">{fr ? "Vos coordonnées" : "Your details"}</h3>
          <Field label={fr ? "Nom complet *" : "Full name *"} name="fullName" required placeholder="Your full name" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email *" name="email" type="email" required placeholder="you@example.com" />
            <Field label={fr ? "Téléphone *" : "Phone number *"} name="phone" type="tel" required placeholder="+1 (416) 000-0000" />
          </div>
        </div>
        <div className="flex items-start gap-3 border border-primary/15 bg-secondary/20 p-4">
          <LockKeyhole size={19} className="mt-0.5 shrink-0 text-primary" />
          <p className="font-body text-xs leading-relaxed text-ink-600">
            {fr ? "Vous serez redirigé vers Stripe pour payer l'acompte de 35 %. Le rendez-vous est confirmé uniquement après vérification du paiement." : "You’ll be redirected to Stripe’s secure checkout to pay the 35% deposit. Your appointment is not confirmed until payment is verified."}
          </p>
        </div>
        {error && <p role="alert" className="mt-4 font-body text-sm text-maison-berry">{error}</p>}
        <button type="submit" disabled={loading || availabilityLoading || !date || !time || Boolean(availabilityError) || availableTimes.length === 0} className="mt-6 inline-flex h-14 w-full items-center justify-center bg-primary px-6 font-body text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Opening secure checkout…" : `${fr ? "Payer l'acompte" : "Pay deposit"} · ${formatCad(depositAmount)} CAD`}
        </button>
      </div>
      <aside className="h-fit border border-primary/15 bg-secondary/20 p-6">
        <h3 className="mb-5 font-headline text-xs uppercase tracking-crown">{fr ? "Sommaire" : "Booking summary"}</h3>
        <p className="font-editorial text-xl italic text-ink-700">{selectedStyle?.name}</p>
        <p className="mt-2 font-body text-xs text-ink-500">{currentSize?.label[lang]}{currentSize?.duration ? ` · ${currentSize.duration}` : ""}</p>
        <div className="mt-6 space-y-3 border-t border-primary/15 pt-5 font-body text-sm">
          <div className="flex justify-between gap-4"><span className="text-ink-500">{fr ? "Prix total" : "Full service price"}</span><span>{formatCad(serviceAmount)}</span></div>
          <div className="flex justify-between gap-4 font-medium text-ink-800"><span>{fr ? "Acompte (35 %)" : "Deposit (35%)"}</span><span>{formatCad(depositAmount)}</span></div>
          <div className="flex justify-between gap-4 text-xs text-ink-500"><span>{fr ? "Solde au rendez-vous" : "Balance at appointment"}</span><span>{formatCad(Math.max(0, serviceAmount - depositAmount))}</span></div>
        </div>
        <p className="mt-6 font-body text-[11px] leading-relaxed text-ink-400">{fr ? "Le paiement de l'acompte sécurise le créneau. Les créneaux et la limite de cinq rendez-vous par jour sont vérifiés sur le serveur." : "The deposit secures your time. Slot availability and the five-appointment daily limit are enforced on the server."}</p>
      </aside>
    </form>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="mb-4 block font-body text-xs text-ink-600">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 h-11 w-full border border-primary/20 bg-background px-3 text-sm text-ink-800 outline-none focus:border-primary" /></label>;
}

function ConsentGate({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const c = t.policies;
  const [policies, setPolicies] = useState(false);
  const [guide, setGuide] = useState(false);
  const [health, setHealth] = useState(false);
  const [hair, setHair] = useState(false);
  const ready = policies && guide && health && hair;

  return (
    <div className="relative">
      {!ready && (
        <div className="border border-primary/20 bg-secondary/20 p-5 sm:p-6">
          <h3 className="cinzel-label mb-1">{c.confirmTitle}</h3>
          <p className="mb-5 font-body text-xs text-ink-500">{c.confirmIntro}</p>
          <div className="space-y-4">
            <CheckRow checked={policies} onChange={setPolicies}>{c.c1pre}<Link to="/politiques" target="_blank" className="text-primary underline hover:text-primary/80" onClick={(event) => event.stopPropagation()}>{c.c1link}</Link>{c.c1post}</CheckRow>
            <CheckRow checked={guide} onChange={setGuide}>{c.c2pre}<SizeGuide label={c.c2link} icon={false} className="text-primary underline hover:text-primary/80" />{c.c2post}</CheckRow>
            <CheckRow checked={health} onChange={setHealth}>{c.c3}</CheckRow>
            <CheckRow checked={hair} onChange={setHair}>{c.c4}</CheckRow>
          </div>
          <p className="pt-6 text-center font-editorial italic text-ink-400">{c.confirmToSee}</p>
        </div>
      )}
      {ready && <div className="mb-6 flex items-center gap-3 border border-primary/30 bg-primary/5 p-4 sm:p-5"><CheckCircle2 className="shrink-0 text-primary" size={24} /><div><p className="cinzel-label mb-0.5">{c.confirmedTitle}</p><p className="font-body text-xs text-ink-500">{c.confirmedText}</p></div></div>}
      <div aria-hidden={!ready} className={ready ? "block" : "pointer-events-none absolute top-0 left-0 -z-10 w-full opacity-0 select-none"}>{children}</div>
    </div>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) {
  return <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" /><span className="font-body text-xs leading-relaxed text-ink-600">{children}</span></label>;
}
