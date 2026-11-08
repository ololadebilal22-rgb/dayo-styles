import catalogueRaw from "@/data/catalogue.json";
import i18nRaw from "@/data/i18n.json";

export type Lang = "en" | "fr";

export type Copy = (typeof i18nRaw)["en"];

export const copy = i18nRaw as { en: Copy; fr: Copy };

type Bi = { en: string; fr: string };

export type RawStyle = (typeof catalogueRaw.catalogue)[number] & {
  note?: Bi;
  quote?: boolean;
  contactOnly?: boolean;
  chooseVariant?: boolean;
};

export const styles = catalogueRaw.catalogue as RawStyle[];
export const familyFilters = catalogueRaw.filters;
export const depositRate = catalogueRaw.depositRate;
export const site = catalogueRaw.site;
export const bookingIds = catalogueRaw.bookingIds as Record<string, string>;

export const SERVICE_MENU_ID = "6a314370cdeb88b6e6990eb3";

// Responsive homepage hero footage is installed in public/videos/.
// Desktop uses the landscape rendition; phones use the original portrait clip.
export const HERO_VIDEO = "/videos/hero.mp4";
export const HERO_VIDEO_MOBILE = "/videos/hero-mobile.mp4";
export const HERO_POSTER = "/hero_background.webp";

export const POPULAR = [
  {
    title: "Boho Knotless Braids",
    price: "180$",
    duration: "5h",
    slug: "boho-knotless",
    img: "/catalogue/boho-knotless-1.jfif",
  },
  {
    title: "French Curl Braids",
    price: "170$",
    duration: "5h",
    slug: "french-curl",
    img: "/catalogue/french-curl-1.jfif",
  },
  {
    title: "Bora Bora",
    price: "205$",
    duration: "5h30",
    slug: "bora-bora",
    img: "/catalogue/bora-bora-1.jfif",
  },
  {
    title: "Passion Twist",
    price: "180$",
    duration: "5h",
    slug: "passion-twist",
    img: "/catalogue/passion-twist-1.jfif",
  },
] as const;

export const ADDON_PRICES = ["15$", "25$", "30$", "30$"];

export function tOf(lang: Lang) {
  return copy[lang];
}

export function bi(value: Bi | undefined, lang: Lang) {
  return value ? value[lang] : "";
}

export type LocalizedSize = {
  label: string;
  price: number;
  duration?: string;
  extensions?: string;
};

export type LocalizedStyle = {
  slug: string;
  name: string;
  filterLabel: string;
  family: string;
  cover: string;
  gallery: string[];
  tagline: string;
  description: string;
  goodToKnow: string[];
  sizes: LocalizedSize[];
  priceFrom: number;
  extensions: string;
  length: string;
  note?: string;
  quote?: boolean;
  contactOnly?: boolean;
  chooseVariant?: boolean;
};

export function localizeStyle(style: RawStyle, lang: Lang): LocalizedStyle {
  return {
    slug: style.slug,
    name: style.name,
    filterLabel: style.filterLabel,
    family: style.family,
    cover: style.cover,
    gallery: style.gallery,
    tagline: style.tagline[lang],
    description: style.description[lang],
    goodToKnow: (style.goodToKnow ?? []).map((item) => item[lang]),
    sizes: style.sizes.map((size) => ({
      label: size.label[lang],
      price: size.price,
      duration: size.duration,
      extensions: "extensions" in size ? size.extensions[lang] : undefined,
    })),
    priceFrom: style.priceFrom,
    extensions: style.extensions[lang],
    length: style.length[lang],
    note: style.note?.[lang],
    quote: style.quote,
    contactOnly: style.contactOnly,
    chooseVariant: style.chooseVariant,
  };
}

export function catalogueFor(lang: Lang) {
  return styles.map((style) => localizeStyle(style, lang));
}

export function familyLabel(key: string, lang: Lang) {
  return familyFilters.find((filter) => filter.key === key)?.label[lang] ?? key;
}

export function styleBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return styles.find((style) => style.slug === slug);
}

export function bookingOptions(slug: string) {
  const options: { size?: string; id: string }[] = [];
  for (const [key, id] of Object.entries(bookingIds)) {
    if (key === slug) options.push({ id });
    else if (key.startsWith(`${slug}::`)) {
      options.push({ size: key.slice(slug.length + 2), id });
    }
  }
  return options;
}

export function bookingIdFor(slug: string, size?: string) {
  if (size && bookingIds[`${slug}::${size}`]) return bookingIds[`${slug}::${size}`];
  return bookingIds[slug];
}

export function hasBooking(slug: string) {
  return Object.keys(bookingIds).some((key) => key === slug || key.startsWith(`${slug}::`));
}

export function depositOf(price: number) {
  return Math.round(price * depositRate);
}

export function priceSpan(style: LocalizedStyle) {
  const max = Math.max(...style.sizes.map((size) => size.price));
  if (style.quote || max === style.priceFrom) return `${style.priceFrom}$`;
  return `${style.priceFrom}$ – ${max}$`;
}
