import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Ruler, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLang } from "@/lib/lang";
import { site, type Lang } from "@/lib/salon";
import { CartProvider, useCart } from "@/lib/cart";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartToast />
    </CartProvider>
  );
}

function CartLink({ count, label }: { count: number; label: string }) {
  return (
    <Link to="/cart" aria-label={label} className="relative text-ink-700 transition-colors hover:text-primary">
      <ShoppingBag size={20} />
      <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-body text-[9px] text-primary-foreground">
        {count}
      </span>
    </Link>
  );
}

function CartToast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 border border-primary/40 bg-ink-800 px-5 py-3 font-body text-xs tracking-wide text-maison-cream shadow-lg">
      {toast}
    </div>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  const codes: Lang[] = ["en", "fr"];
  return (
    <div className="inline-flex items-center border border-primary/30" role="group" aria-label="Language / Langue">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 font-body text-[11px] uppercase tracking-widest transition-colors ${
            lang === code ? "bg-primary text-primary-foreground" : "bg-transparent text-ink-500 hover:text-primary"
          }`}
        >
          {code === "en" ? "EN" : "FR"}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const links = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.tarifs, href: "/tarifs" },
    { name: t.nav.atelier, href: "/styliste" },
    { name: t.nav.catalogue, href: "/catalogue" },
    { name: t.nav.shop, href: "/shop" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" aria-label={t.nav.homeAria} className="flex items-center">
          <img src="/brand-logo.png" alt="DayoStyles" width={1254} height={1254} className="h-14 w-auto" />
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-body text-xs uppercase tracking-widest transition-colors hover:text-primary ${
                  pathname === link.href ? "font-bold text-primary" : "text-ink-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <CartLink count={count} label={t.nav.cart} />
          <LangSwitch />
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <CartLink count={count} label={t.nav.cart} />
          <LangSwitch />
          <button type="button" className="text-ink-700" aria-label="Toggle menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute top-20 left-0 w-full border-b border-primary/20 bg-background lg:hidden">
          <nav className="flex flex-col space-y-4 p-6">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`border-b border-secondary/50 py-2 font-body text-sm uppercase tracking-widest ${
                  pathname === link.href ? "text-primary" : "text-ink-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-primary/10 bg-ink-800 px-6 py-16 text-secondary">
      <div className="container mx-auto grid grid-cols-1 gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <img src="/brand-logo.png" alt="DayoStyles" width={1254} height={1254} className="h-16 w-auto" />
          <p className="max-w-xs font-body text-xs leading-relaxed text-secondary/60">{t.footer.tagline}</p>
        </div>
        <div>
          <h3 className="mb-6 font-headline text-[10px] uppercase tracking-crown opacity-60">{t.footer.quickLinks}</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/services" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.services}
              </Link>
            </li>
            <li>
              <Link to="/tarifs" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.tarifs}
              </Link>
            </li>
            <li>
              <Link to="/reservation" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.booking}
              </Link>
            </li>
            <li>
              <Link to="/politiques" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.policies}
              </Link>
            </li>
            <li>
              <Link to="/shop" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.shop}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="font-body text-xs transition-colors hover:text-primary">
                {t.footer.cart}
              </Link>
            </li>
            <li>
              <SizeGuide className="font-body text-xs hover:text-primary" icon={false} />
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-6 font-headline text-[10px] uppercase tracking-crown opacity-60">{t.footer.contact}</h3>
          <address className="space-y-3 font-body text-xs text-secondary/80 not-italic">
            <p>{site.address.street}</p>
            <p>
              {site.address.city}, {site.address.province} {site.address.postalCode}
            </p>
            <p>
              <a href={site.phoneHref} className="transition-colors hover:text-primary">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-primary">
                {site.email}
              </a>
            </p>
          </address>
        </div>
        <div>
          <h3 className="mb-6 font-headline text-[10px] uppercase tracking-crown opacity-60">{t.footer.social}</h3>
          <div className="flex space-x-4">
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="font-body text-xs hover:text-primary">
              Instagram
            </a>
            <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className="font-body text-xs hover:text-primary">
              TikTok
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-16 flex flex-col items-center justify-between border-t border-white/5 pt-8 text-[10px] uppercase tracking-widest text-secondary/40 md:flex-row">
        <p>{t.footer.copyright}</p>
        <p className="mt-4 md:mt-0">{t.footer.signature}</p>
      </div>
    </footer>
  );
}

export function SizeGuide({
  className = "",
  icon = true,
  label,
}: {
  className?: string;
  icon?: boolean;
  label?: string;
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const guide =
    lang === "fr"
      ? { src: "/size-guide-fr.webp", w: 1535, h: 1024 }
      : { src: "/size-guide-en.webp", w: 1672, h: 941 };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`${icon ? "inline-flex items-center gap-2" : "inline"} transition-colors ${className}`}
      >
        {icon && <Ruler size={14} className="text-primary" />}
        {label ?? t.sizeGuide.cta}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label={t.sizeGuide.title}
            className="max-h-[92vh] w-[95vw] max-w-5xl overflow-y-auto border border-secondary bg-background"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="sr-only">{t.sizeGuide.title}</span>
              <span className="font-headline text-xs uppercase tracking-crown text-ink-700">{t.sizeGuide.title}</span>
              <button type="button" className="text-ink-500 hover:text-primary" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <img src={guide.src} alt={t.sizeGuide.title} width={guide.w} height={guide.h} className="h-auto w-full" />
          </div>
        </div>
      )}
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone?: "dark" | "soft";
}) {
  const dark = tone === "dark";
  return (
    <section className={dark ? "border-b border-primary/20 bg-ink-800 py-24 text-maison-cream" : "border-b border-primary/10 bg-secondary/20 py-24"}>
      <div className="container mx-auto px-6 text-center">
        <span className={`cinzel-label mb-4 block ${dark ? "text-primary" : ""}`}>{eyebrow}</span>
        <h1 className="mb-8 font-headline text-5xl tracking-crown uppercase md:text-6xl">{title}</h1>
        <p className={`mx-auto max-w-2xl font-editorial text-xl italic md:text-2xl ${dark ? "text-maison-cream/60" : "text-ink-500"}`}>{subtitle}</p>
      </div>
    </section>
  );
}

export function ContactRow({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const size = compact ? 14 : 15;
  return (
    <div className={`flex flex-col justify-center gap-3 sm:flex-row sm:gap-6 ${className}`}>
      <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 font-body text-xs text-ink-600 transition-colors hover:text-primary">
        <MailIcon size={size} />
        {site.email}
      </a>
      <a href={site.phoneHref} className="inline-flex items-center gap-2 font-body text-xs text-ink-600 transition-colors hover:text-primary">
        <PhoneIcon size={size} />
        {site.phone}
      </a>
      <a
        href={site.social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-body text-xs text-ink-600 transition-colors hover:text-primary"
      >
        <IgIcon size={size} />
        Instagram
      </a>
    </div>
  );
}

function MailIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function PhoneIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IgIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
