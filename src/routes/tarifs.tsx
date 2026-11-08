import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHero } from "@/components/shell";
import { useLang } from "@/lib/lang";
import { catalogueFor, depositOf } from "@/lib/salon";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [{ title: "Pricing · Dayo Styles Toronto" }],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  const { t, lang } = useLang();
  const rows = useMemo(
    () =>
      catalogueFor(lang).flatMap((style) =>
        style.sizes.map((size, index) => ({
          cat: style.name,
          variant: size.label,
          price: size.price,
          duration: size.duration ?? "—",
          extensions: size.extensions ?? style.extensions,
          first: index === 0,
          span: style.sizes.length,
        })),
      ),
    [lang],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHero eyebrow={t.tarifs.eyebrow} title={t.tarifs.title} subtitle={t.tarifs.subtitle} />
      <section className="section-spacing container mx-auto px-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] caption-bottom text-sm">
            <thead>
              <tr className="border-b border-secondary">
                {[t.tarifs.colCategory, t.tarifs.colVariant, t.tarifs.colPrice, t.tarifs.colDeposit, t.tarifs.colDuration, t.tarifs.colExtensions].map(
                  (col) => (
                    <th key={col} className="h-12 px-4 text-left align-middle font-headline text-[10px] font-medium uppercase tracking-crown text-ink-400">
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.cat}-${row.variant}-${index}`} className="border-b border-secondary/60 transition-colors hover:bg-secondary/20">
                  <td className="p-4 align-middle font-headline text-xs uppercase tracking-widest text-ink-800">{row.first ? row.cat : ""}</td>
                  <td className="p-4 align-middle font-body text-sm text-ink-700">{row.variant}</td>
                  <td className="p-4 align-middle font-body text-sm font-bold text-primary whitespace-nowrap">{row.price} $</td>
                  <td className="p-4 align-middle font-body text-sm text-ink-500 whitespace-nowrap">{depositOf(row.price)} $</td>
                  <td className="p-4 align-middle font-body text-sm text-ink-500">{row.duration}</td>
                  <td className="min-w-[220px] p-4 align-middle font-body text-xs text-ink-500">{row.extensions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="border border-maison-berry/20 bg-maison-berry/5 p-8">
            <h3 className="mb-4 font-headline text-[10px] uppercase tracking-crown text-maison-berry">{t.tarifs.noteTitle}</h3>
            <ul className="list-inside list-disc space-y-3 font-body text-sm text-ink-500">
              {t.tarifs.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="border border-secondary bg-secondary/20 p-8">
            <h3 className="mb-4 font-headline text-[10px] uppercase tracking-crown text-primary">{t.tarifs.addonsTitle}</h3>
            <ul className="space-y-3 font-body text-sm text-ink-500">
              {t.tarifs.addons.map((addon) => (
                <li key={addon.label} className="flex justify-between gap-4">
                  <span>{addon.label}</span>
                  <span className="font-bold text-primary">{addon.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/catalogue"
            className="inline-flex h-14 items-center justify-center bg-ink-800 px-12 font-headline text-[11px] uppercase tracking-crown text-primary-foreground transition-colors duration-300 hover:bg-primary"
          >
            {t.tarifs.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
