import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { HERO_POSTER, HERO_VIDEO, HERO_VIDEO_MOBILE, POPULAR } from "@/lib/salon";
import { formatCad, products } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dayo Styles · Braiding Salon in Toronto | Knotless, Box Braids & Twists" },
      {
        name: "description",
        content:
          "Dayo Styles is a high-end braiding salon in North York (2020 Sheppard Ave W). Knotless braids, box braids, French curl, boho braids, passion & marley twists, soft locs, cornrows and sew-ins — hand-finished, every time.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useLang();
  return (
    <div className="flex flex-col">
      <Hero />
      <section className="section-spacing container mx-auto px-6">
        <div className="mx-auto mb-6 max-w-4xl text-center md:mb-10">
          <h2 className="mb-4 font-editorial text-3xl italic text-ink-700 md:mb-6 md:text-6xl">
            {t.home.introTitle}
          </h2>
          <p className="font-editorial text-lg italic text-ink-500 md:text-xl">
            {t.home.introSubtitle}
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
          {[
            { title: t.home.value1Title, desc: t.home.value1Desc },
            { title: t.home.value2Title, desc: t.home.value2Desc },
          ].map((item) => (
            <div
              key={item.title}
              className="group border border-primary/5 p-6 text-center transition-all hover:border-primary/20 md:p-8"
            >
              <h3 className="gold-hairline mb-4 inline-block pb-2 font-headline text-xs uppercase tracking-crown text-primary">
                {item.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-spacing container mx-auto px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:mb-10 md:flex-row md:items-end md:gap-6">
          <div>
            <span className="cinzel-label mb-2 block">{t.home.popularEyebrow}</span>
            <h2 className="font-headline text-3xl uppercase tracking-crown md:text-4xl">
              {t.home.servicesTitle}
            </h2>
          </div>
          <Link
            to="/services"
            className="font-body text-xs uppercase tracking-widest text-primary underline-offset-4 hover:underline"
          >
            {t.home.allServices}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {POPULAR.map((item) => (
            <article key={item.slug} className="group">
              <Link
                to="/catalogue"
                search={{ style: item.slug }}
                className="relative mb-3 block aspect-[3/4] overflow-hidden md:mb-6"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                />
              </Link>
              <h3 className="mb-2 font-editorial text-lg italic text-ink-700 md:text-xl">
                {item.title}
              </h3>
              <p className="mb-3 font-body text-[10px] uppercase tracking-widest text-ink-400 md:mb-4">
                {t.home.from} {item.price} · {item.duration}
              </p>
              <Link
                to="/catalogue"
                className="border-b border-primary/30 pb-1 font-body text-[10px] uppercase tracking-widest text-primary transition-all hover:border-primary"
              >
                {t.home.viewStyle}
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center md:mt-14">
          <Link
            to="/catalogue"
            className="inline-flex h-14 items-center bg-primary px-12 font-body text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            {t.home.viewCatalogue}
          </Link>
        </div>
      </section>

      <section className="section-spacing bg-paper">
        <div className="container mx-auto px-6">
          <div className="mb-7 flex flex-col items-start justify-between gap-4 md:mb-10 md:flex-row md:items-end">
            <div>
              <span className="cinzel-label mb-2 block">{t.home.heroEyebrow}</span>
              <h2 className="font-headline text-3xl uppercase tracking-crown md:text-4xl">
                {t.home.shopTitle}
              </h2>
              <p className="mt-3 max-w-xl font-editorial text-lg italic text-ink-500 md:text-xl">
                {t.home.shopSubtitle}
              </p>
            </div>
            <Link
              to="/shop"
              className="border-b border-primary/40 pb-1 font-body text-xs uppercase tracking-widest text-primary hover:border-primary"
            >
              {t.home.shopAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 4).map((product, index) => (
              <article
                key={product.id}
                className={`group flex flex-col border border-primary/10 bg-background ${index === 0 ? "lg:col-span-1" : ""}`}
              >
                <Link
                  to="/shop"
                  className={`relative block overflow-hidden bg-secondary/20 ${index === 0 ? "aspect-[4/5]" : "aspect-[4/5]"}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute left-2 top-2 bg-ink-800 px-2 py-1 font-body text-[9px] uppercase tracking-widest text-maison-cream sm:left-3 sm:top-3">
                      {product.badge}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <h3 className="mb-2 font-editorial text-base italic leading-snug text-ink-700 sm:text-xl">
                    {product.name}
                  </h3>
                  <p className="mb-4 font-body text-xs text-primary">
                    {formatCad(product.price)} CAD
                  </p>
                  <Link
                    to="/shop"
                    className="mt-auto border border-primary/30 px-3 py-2 text-center font-body text-[9px] uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:text-[10px]"
                  >
                    {t.home.shopItemCta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              to="/shop"
              className="inline-flex h-14 items-center bg-primary px-12 font-body text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              {t.home.shopAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-secondary/20">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-6 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/5] border border-secondary bg-maison-cream md:aspect-square">
            <img
              src="/brand-logo.png"
              alt="DayoStyles"
              className="h-full w-full object-contain p-10"
            />
          </div>
          <div>
            <span className="cinzel-label mb-4 block">{t.home.stylistEyebrow}</span>
            <h2 className="mb-4 font-editorial text-4xl italic text-ink-700 md:mb-8 md:text-5xl">
              Dayo
            </h2>
            <p className="mb-8 font-body text-base leading-relaxed text-ink-500 md:mb-12 md:text-lg">
              {t.home.stylistBio}
            </p>
            <Link
              to="/styliste"
              className="inline-flex border border-primary px-8 py-3 font-body text-xs uppercase tracking-crown text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t.home.learnMore}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-ink-800 text-maison-cream">
        <div className="container mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 font-headline text-3xl uppercase tracking-crown md:mb-6 md:text-4xl">
            {t.home.finalCtaTitle}
          </h2>
          <p className="mb-8 font-editorial text-xl italic text-maison-cream/60 md:mb-12 md:text-2xl">
            {t.home.finalCtaSubtitle}
          </p>
          <Link
            to="/catalogue"
            className="inline-flex h-14 items-center bg-primary px-16 font-body text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            {t.home.bookNow}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  const { t } = useLang();
  // Use a landscape video on larger screens and an optional portrait crop on phones.
  // If the portrait asset is not present, the video falls back to the landscape file.
  const [videoSource, setVideoSource] = useState(HERO_VIDEO);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateVideoSource = () => {
      setVideoSource(mediaQuery.matches ? HERO_VIDEO_MOBILE : HERO_VIDEO);
    };

    updateVideoSource();
    mediaQuery.addEventListener("change", updateVideoSource);
    return () => mediaQuery.removeEventListener("change", updateVideoSource);
  }, []);

  return (
    <section className="relative flex h-[86svh] min-h-[520px] max-h-[960px] items-center justify-center overflow-hidden bg-ink-800 md:h-[90vh] md:min-h-[680px]">
      <div className="absolute inset-0 overflow-hidden">
        {/* Keep a still image visible for reduced-motion users and while the video loads. */}
        <img
          src={HERO_POSTER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <video
          key={videoSource}
          src={videoSource}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER}
          aria-hidden="true"
          onError={() => {
            if (videoSource !== HERO_VIDEO) setVideoSource(HERO_VIDEO);
          }}
          className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-800/65 via-ink-800/55 to-ink-800/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(17,13,8,0.5)_0%,transparent_75%)]" />
      </div>
      <div className="hero-shadow relative z-10 px-6 text-center">
        <img
          src="/brand-icon.png"
          alt="Dayo Styles"
          width={291}
          height={730}
          className="mx-auto mb-8 h-28 w-auto md:h-36"
        />
        <span className="cinzel-label mb-4 block text-gold-soft">{t.home.heroEyebrow}</span>
        <h1 className="mb-6 font-headline text-4xl uppercase tracking-crown text-maison-cream sm:text-5xl md:text-8xl">
          Dayo Styles
        </h1>
        <p className="mx-auto mb-10 max-w-2xl font-editorial text-lg italic text-maison-cream/80 md:mb-12 md:text-2xl">
          {t.home.heroSubtitle}
        </p>
        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <Link
            to="/catalogue"
            className="inline-flex h-14 items-center justify-center bg-primary px-12 font-body text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            {t.home.ctaBook}
          </Link>
          <Link
            to="/services"
            className="inline-flex h-14 items-center justify-center border border-primary bg-paper px-12 font-body text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {t.home.ctaServices}
          </Link>
        </div>
      </div>
    </section>
  );
}
