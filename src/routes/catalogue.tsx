import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StyleModal } from "@/components/style-modal";
import { useLang } from "@/lib/lang";
import { catalogueFor, familyLabel, styleBySlug, type RawStyle } from "@/lib/salon";

type Search = { style?: string };

export const Route = createFileRoute("/catalogue")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    style: typeof search.style === "string" ? search.style : undefined,
  }),
  head: () => ({
    meta: [{ title: "Catalogue of Braiding Styles · Dayo Styles Toronto" }],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const { style: initial } = Route.useSearch();
  const { t, lang } = useLang();
  const catalogue = useMemo(() => catalogueFor(lang), [lang]);
  const [filter, setFilter] = useState("all");
  const [selection, setSelection] = useState<{ style: RawStyle; img?: string } | null>(() => {
    const found = styleBySlug(initial);
    return found ? { style: found, img: found.cover } : null;
  });

  const filters = [{ slug: "all", label: t.catalogue.all }, ...catalogue.map((style) => ({ slug: style.slug, label: style.filterLabel }))];
  const active = filter === "all" ? null : catalogue.find((style) => style.slug === filter);
  const cards = active
    ? active.gallery.length
      ? active.gallery.map((img, index) => ({ key: `${active.slug}-${index}`, img, slug: active.slug }))
      : [{ key: active.slug, img: "", slug: active.slug }]
    : catalogue.map((style) => ({ key: style.slug, img: style.cover, slug: style.slug }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="border-b border-primary/5 bg-secondary/10 py-24">
        <div className="container mx-auto px-6 text-center">
          <span className="cinzel-label mb-4 block">{t.catalogue.eyebrow}</span>
          <h1 className="mb-8 font-headline text-5xl uppercase tracking-crown md:text-6xl">{t.catalogue.title}</h1>
          <p className="mx-auto max-w-2xl font-editorial text-xl italic text-ink-500 md:text-2xl">{t.catalogue.subtitle}</p>
        </div>
      </section>

      <section className="sticky top-20 z-40 border-b border-secondary bg-background/80 py-8 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {filters.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setFilter(item.slug)}
                className={`font-body text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                  filter === item.slug ? "border-b border-primary pb-2 text-primary" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing container mx-auto px-6">
        {active && (
          <div className="mb-12 text-center">
            <span className="cinzel-label mb-3 block">{familyLabel(active.family, lang)}</span>
            <h2 className="mb-2 font-headline text-3xl uppercase tracking-crown md:text-4xl">{active.name}</h2>
            <p className="font-editorial text-lg italic text-ink-500">{active.tagline}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {cards.map((card, index) => {
            const style = catalogue.find((item) => item.slug === card.slug)!;
            const raw = styleBySlug(card.slug)!;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelection({ style: raw, img: card.img || raw.cover })}
                className={`group relative overflow-hidden bg-secondary/20 text-left transition-all duration-700 ${index % 3 === 0 ? "md:row-span-2" : ""}`}
              >
                {card.img ? (
                  <img
                    src={card.img}
                    alt={style.name}
                    className={`w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 ${
                      index % 3 === 0 ? "aspect-[3/4] md:aspect-[3/5]" : "aspect-[4/5]"
                    }`}
                  />
                ) : (
                  <div className="flex min-h-[280px] w-full flex-col items-center justify-center bg-secondary/30 p-6 text-center">
                    <span className="cinzel-label mb-2 text-ink-400">{familyLabel(style.family, lang)}</span>
                    <span className="font-editorial text-xl italic text-ink-600">{style.name}</span>
                    <span className="mt-3 font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">{t.catalogue.onRequest}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink-800/40 p-6 text-center opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                  <div>
                    <span className="cinzel-label mb-2 block text-maison-gold">{familyLabel(style.family, lang)}</span>
                    <span className="mb-3 block font-editorial text-lg italic text-maison-cream">{style.name}</span>
                    <span className="inline-block border border-maison-cream/40 px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.2em] text-maison-cream/80">
                      {t.catalogue.viewDetails}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selection && (
        <StyleModal
          key={`${selection.style.slug}-${selection.img ?? ""}`}
          raw={selection.style}
          initialImg={selection.img}
          onClose={() => setSelection(null)}
          onPick={(style) => setSelection({ style, img: style.cover })}
        />
      )}
    </div>
  );
}
