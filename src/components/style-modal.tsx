import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Clock, Scissors, X } from "lucide-react";
import { useState } from "react";
import { ContactRow, SizeGuide } from "@/components/shell";
import { useLang } from "@/lib/lang";
import { depositOf, familyLabel, localizeStyle, priceSpan, site, styles, type LocalizedStyle, type RawStyle } from "@/lib/salon";

export function StyleModal({
  raw,
  initialImg,
  onClose,
  onPick,
}: {
  raw: RawStyle;
  initialImg?: string;
  onClose: () => void;
  onPick: (style: RawStyle) => void;
}) {
  const { t, lang } = useLang();
  const style = localizeStyle(raw, lang);
  const [img, setImg] = useState(initialImg || style.cover);
  const family = styles
    .filter((item) => item.family === raw.family && item.slug !== raw.slug)
    .map((item) => localizeStyle(item, lang));
  const durations = [...new Set(style.sizes.map((size) => size.duration).filter(Boolean))].join(" – ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={style.name}
        className="relative max-h-[92vh] w-[95vw] max-w-5xl overflow-y-auto border border-secondary bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="sticky top-3 z-10 float-right mr-3 mt-3 text-ink-500 hover:text-primary" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="flex flex-col">
          <div className="grid md:grid-cols-2">
            <div className="bg-secondary/20">
              <div className="relative aspect-[4/5] w-full">
                {style.cover ? (
                  <img src={img} alt={style.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/30 p-8 text-center">
                    <span className="cinzel-label text-ink-400">{familyLabel(style.family, lang)}</span>
                    <span className="font-headline text-2xl tracking-crown uppercase text-ink-600">{style.name}</span>
                    <span className="font-editorial text-lg italic text-ink-500">{t.catalogue.photosSoon}</span>
                  </div>
                )}
              </div>
              {style.gallery.length > 1 && (
                <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                  {style.gallery.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setImg(src)}
                      className={`relative h-16 w-14 shrink-0 overflow-hidden border transition-all ${
                        img === src ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col p-8 md:p-10">
              <span className="cinzel-label mb-3 block">{familyLabel(style.family, lang)}</span>
              <h2 className="mb-3 font-headline text-3xl tracking-crown uppercase md:text-4xl">{style.name}</h2>
              <p className="mb-5 font-editorial text-lg italic text-ink-500">{style.tagline}</p>
              <p className="mb-6 font-body text-sm leading-relaxed text-ink-600">{style.description}</p>
              <div className="mb-6 flex items-end justify-between border-y border-secondary py-4">
                <div>
                  <span className="mb-1 block font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">
                    {style.quote ? t.catalogue.from : t.catalogue.price}
                  </span>
                  <span className="font-headline text-2xl text-primary">{priceSpan(style)}</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">{t.catalogue.deposit}</span>
                  <span className="font-headline text-lg text-ink-700">
                    {t.catalogue.depositFrom} {depositOf(style.priceFrom)}$
                  </span>
                </div>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-3 font-body text-sm text-ink-600">
                  <Scissors size={15} className="mt-0.5 shrink-0 text-primary" />
                  <span>{style.extensions}</span>
                </li>
                {durations && (
                  <li className="flex items-start gap-3 font-body text-sm text-ink-600">
                    <Clock size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      {t.catalogue.estDuration} {durations}
                    </span>
                  </li>
                )}
                {style.goodToKnow.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-ink-600">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mb-2 flex justify-end">
                <SizeGuide className="font-body text-[11px] uppercase tracking-widest text-ink-500 hover:text-primary" icon={false} />
              </div>
              <SizeTable style={style} />
              {style.note && (
                <div className="mb-4 border-l-2 border-maison-berry bg-maison-berry/5 px-4 py-3 font-body text-[11px] leading-relaxed text-maison-berry">
                  {style.note}
                </div>
              )}
              <ContactRow compact className="mb-6 sm:justify-start" />
              {style.contactOnly ? (
                <div className="mt-auto flex flex-col gap-2">
                  <span className="text-center font-body text-[10px] uppercase tracking-[0.2em] text-ink-400">{t.catalogue.dmToBook}</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      href={`mailto:${site.email}`}
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 break-all bg-ink-800 px-2 font-body text-xs text-primary-foreground transition-colors duration-300 hover:bg-primary"
                    >
                      {site.email}
                    </a>
                    <a
                      href={site.phoneHref}
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 border border-ink-800 font-headline text-[11px] uppercase tracking-crown text-ink-800 transition-colors duration-300 hover:bg-ink-800 hover:text-primary-foreground"
                    >
                      {site.phone}
                    </a>
                    <a
                      href={site.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 border border-ink-800 font-headline text-[11px] uppercase tracking-crown text-ink-800 transition-colors duration-300 hover:bg-ink-800 hover:text-primary-foreground"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ) : (
                <Link
                  to="/reservation"
                  search={{ service: style.slug }}
                  className="group mt-auto inline-flex h-14 items-center justify-center gap-2 bg-ink-800 font-headline text-[11px] uppercase tracking-crown text-primary-foreground transition-colors duration-300 hover:bg-primary"
                >
                  {t.catalogue.bookAppt}
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </div>
          {family.length > 0 && (
            <div className="border-t border-secondary bg-secondary/10 p-8 md:p-10">
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="cinzel-label">{t.catalogue.sameFamily}</h3>
                <span className="font-editorial text-sm italic text-ink-400">{familyLabel(style.family, lang)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {family.map((item) => (
                  <button key={item.slug} type="button" onClick={() => onPick(styles.find((s) => s.slug === item.slug)!)} className="group text-left">
                    <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-secondary/20">
                      <img
                        src={item.cover}
                        alt={item.name}
                        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>
                    <span className="block font-body text-xs uppercase leading-tight tracking-widest text-ink-700 transition-colors group-hover:text-primary">
                      {item.name}
                    </span>
                    <span className="font-headline text-xs text-primary">{familyPrice(item, t.catalogue.fromShort)}</span>
                  </button>
                ))}
              </div>
              <p className="mt-8 text-center font-editorial italic text-ink-500">{t.catalogue.familyTeaser}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function familyPrice(style: LocalizedStyle, fromShort: string) {
  const max = Math.max(...style.sizes.map((size) => size.price));
  if (style.quote) return `${fromShort} ${style.priceFrom}$`;
  if (max === style.priceFrom) return `${style.priceFrom}$`;
  return `${style.priceFrom}$+`;
}

function SizeTable({ style }: { style: LocalizedStyle }) {
  return (
    <div className="mb-6 border border-secondary">
      {style.sizes.map((size, index) => (
        <div
          key={size.label}
          className={`flex items-center justify-between px-4 py-3 ${index < style.sizes.length - 1 ? "border-b border-secondary" : ""}`}
        >
          <span className="font-body text-xs uppercase tracking-widest text-ink-600">
            {size.label}
            {size.duration && <span className="font-normal normal-case tracking-normal text-ink-400"> · {size.duration}</span>}
          </span>
          <span className="font-headline text-sm text-primary">{size.price}$</span>
        </div>
      ))}
    </div>
  );
}
