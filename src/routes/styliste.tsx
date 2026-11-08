import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/shell";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/styliste")({
  head: () => ({
    meta: [{ title: "Leslie · Master Braider · Dayo Styles Toronto" }],
  }),
  component: StylistePage,
});

function StylistePage() {
  const { t } = useLang();
  const days = t.styliste.days.map((day, index) => ({ day, hours: t.styliste.hours[index] }));

  return (
    <div className="flex flex-col">
      <PageHero eyebrow={t.styliste.eyebrow} title={t.styliste.title} subtitle={t.styliste.subtitle} />
      <section className="section-spacing container mx-auto grid grid-cols-1 items-center gap-20 px-6 md:grid-cols-2">
        <div className="relative aspect-[4/5] border border-secondary bg-maison-cream">
          <img src="/brand-logo.png" alt="DayoStyles" className="h-full w-full object-contain p-12" />
        </div>
        <div>
          <h2 className="mb-8 font-editorial text-5xl italic text-ink-700">Leslie</h2>
          <div className="mb-12 space-y-6 font-body leading-relaxed text-ink-500">
            <p className="font-editorial text-xl italic text-maison-berry">{t.styliste.quote1}</p>
            <p>{t.styliste.bio}</p>
            <p className="font-editorial text-xl italic text-ink-700">{t.styliste.quote2}</p>
          </div>
          <Link
            to="/catalogue"
            className="inline-flex h-14 w-full items-center justify-center bg-primary font-body text-xs uppercase tracking-crown text-primary-foreground hover:bg-primary/90"
          >
            {t.styliste.ctaBook}
          </Link>
        </div>
      </section>

      <section className="section-spacing border-t border-primary/10 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <span className="cinzel-label mb-4 block">{t.styliste.availEyebrow}</span>
            <h2 className="mb-6 font-headline text-4xl uppercase tracking-crown md:text-5xl">{t.styliste.availTitle}</h2>
            <p className="font-editorial text-lg italic text-ink-500">{t.styliste.availSubtitle}</p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {days.map((item) => (
              <div key={item.day} className="flex items-center justify-between border border-secondary bg-paper px-5 py-4">
                <span className="font-headline text-[11px] uppercase tracking-crown text-ink-700">{item.day}</span>
                <span className={item.hours ? "font-body text-sm font-bold tracking-wide text-primary" : "font-editorial text-sm italic tracking-wide text-ink-400"}>
                  {item.hours ?? t.styliste.closedLabel}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-secondary bg-paper p-6 text-center">
              <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">{t.styliste.bufferLabel}</span>
              <span className="font-headline text-2xl text-primary">{t.styliste.bufferValue}</span>
            </div>
            <div className="border border-secondary bg-paper p-6 text-center">
              <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">{t.styliste.minNoticeLabel}</span>
              <span className="font-headline text-2xl text-primary">{t.styliste.minNoticeValue}</span>
            </div>
            <div className="flex items-center justify-center border border-maison-berry/20 bg-maison-berry/5 p-6 text-center">
              <span className="font-editorial text-sm leading-relaxed italic text-maison-berry">{t.styliste.lastMinute}</span>
            </div>
          </div>
          <div className="mt-14 text-center">
            <Link
              to="/catalogue"
              className="inline-flex h-14 items-center justify-center bg-ink-800 px-12 font-headline text-[11px] uppercase tracking-crown text-primary-foreground transition-colors duration-300 hover:bg-primary"
            >
              {t.styliste.cta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
