import { createFileRoute, Link } from "@tanstack/react-router";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/lang";
import { ADDON_PRICES, catalogueFor, depositOf, familyFilters, familyLabel } from "@/lib/salon";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [{ title: "Braiding Services · Dayo Styles Toronto" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState("all");
  const catalogue = useMemo(() => catalogueFor(lang), [lang]);
  const visible = filter === "all" ? catalogue : catalogue.filter((style) => style.family === filter);

  return (
    <div className="flex flex-col">
      <section className="border-b border-primary/10 bg-secondary/20 py-24">
        <div className="container mx-auto px-6 text-center">
          <span className="cinzel-label mb-4 block">{t.services.eyebrow}</span>
          <h1 className="mb-8 font-headline text-5xl uppercase tracking-crown md:text-6xl">{t.services.title}</h1>
          <p className="mx-auto max-w-3xl font-editorial text-xl italic text-ink-500 md:text-2xl">{t.services.subtitle}</p>
        </div>
      </section>

      <section className="sticky top-20 z-40 border-b border-secondary bg-background/80 py-8 backdrop-blur-md">
        <div className="no-scrollbar container mx-auto overflow-x-auto px-6">
          <div className="flex min-w-max justify-start space-x-4 md:justify-center">
            {familyFilters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`border px-6 py-2 font-body text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                  filter === item.key ? "border-primary bg-primary text-primary-foreground" : "border-secondary bg-transparent text-ink-500 hover:text-primary"
                }`}
              >
                {item.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing container mx-auto px-6">
        <Accordion.Root type="multiple" className="mx-auto max-w-4xl space-y-6">
          {visible.map((style) => (
            <Accordion.Item key={style.slug} value={style.slug} className="border border-secondary bg-paper/50 px-6">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between py-8 text-left hover:no-underline">
                  <span>
                    <span className="block font-editorial text-2xl italic text-ink-700">{style.name}</span>
                    <span className="mt-1 block font-body text-[10px] uppercase tracking-widest text-ink-400">
                      {familyLabel(style.family, lang)} · {style.quote ? t.services.startingAt : t.services.from} {style.priceFrom}$
                    </span>
                  </span>
                  <ChevronDown size={16} className="shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-8">
                <p className="mb-6 font-body text-sm leading-relaxed text-ink-500">{style.description}</p>
                {style.goodToKnow.length > 0 && (
                  <div className="mb-8">
                    <p className="mb-3 font-body text-[10px] uppercase tracking-widest text-ink-400">{t.services.goodToKnow}</p>
                    <ul className="space-y-2">
                      {style.goodToKnow.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-ink-500">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mb-8 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  {style.sizes.map((size) => (
                    <div key={size.label} className="flex items-center justify-between border-b border-secondary/50 pb-4">
                      <span className="font-body text-sm text-ink-700">{size.label}</span>
                      <div className="text-right">
                        <span className="font-body text-sm font-bold text-primary">{size.price}$</span>
                        {size.duration && <span className="block font-body text-[10px] uppercase tracking-widest text-ink-400">{size.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-6 space-y-2 bg-secondary/20 p-4">
                  <p className="font-body text-[10px] uppercase tracking-widest text-ink-400">{t.services.extLength}</p>
                  <p className="font-body text-sm text-ink-500">{style.extensions}</p>
                  <p className="pt-2 font-body text-[10px] uppercase tracking-widest text-ink-400">{t.services.deposit}</p>
                  <p className="font-body text-sm text-ink-500">
                    {t.services.depositFrom} {depositOf(style.priceFrom)}$
                  </p>
                  {style.note && <div className="mt-4 border-l-2 border-maison-berry bg-maison-berry/10 p-3 font-body text-xs text-maison-berry">{style.note}</div>}
                </div>
                <Link
                  to="/reservation"
                  search={{ service: style.slug }}
                  className="group inline-flex items-center gap-2 border-b border-primary/40 pb-1 font-headline text-[10px] uppercase tracking-crown text-primary transition-all hover:border-primary"
                >
                  {t.services.bookThisStyle}
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section className="section-spacing bg-ink-800 text-maison-cream">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 border-b border-primary/30 pb-4 font-headline text-2xl uppercase tracking-crown">{t.services.addonsTitle}</h2>
            <div className="space-y-8">
              {t.services.addons.map((addon, index) => (
                <div key={addon.name} className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="mb-1 block font-headline text-[10px] uppercase tracking-crown text-primary">{addon.name}</span>
                    <span className="font-editorial text-sm italic text-maison-cream/60">{addon.detail}</span>
                  </div>
                  <span className="font-headline text-xl text-primary">{ADDON_PRICES[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
