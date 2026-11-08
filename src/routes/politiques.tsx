import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHero, SizeGuide } from "@/components/shell";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/politiques")({
  head: () => ({
    meta: [{ title: "Booking Policies · Dayo Styles Toronto" }],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  const { t } = useLang();
  const p = t.policies;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHero eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
      <section className="section-spacing container mx-auto max-w-3xl px-6">
        <Link to="/reservation" className="group mb-10 inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] text-ink-500 transition-colors hover:text-primary">
          <ArrowLeft size={14} />
          {t.reservation.backToBooking}
        </Link>
        <div className="mb-10 space-y-4 border-l-2 border-primary/30 pl-5">
          {p.intro.map((paragraph) => (
            <p key={paragraph} className="font-body text-sm leading-relaxed text-ink-600">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="space-y-10">
          {p.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="mb-3 font-headline text-lg uppercase tracking-crown text-ink-800">{section.heading}</h2>
              <div className="space-y-4">
                {section.blocks.map((block, index) => {
                  if (block.kind === "ul") {
                    return (
                      <ul key={index} className="space-y-2">
                        {block.items?.map((item) => (
                          <li key={item} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink-600">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.kind === "sub") {
                    return (
                      <h3 key={index} className="font-headline text-[11px] uppercase tracking-crown text-primary">
                        {block.text}
                      </h3>
                    );
                  }
                  return (
                    <p key={index} className="font-body text-sm leading-relaxed text-ink-600">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 border border-primary/20 bg-secondary/20 p-6 sm:p-8">
          <h3 className="cinzel-label mb-1">{p.confirmTitle}</h3>
          <p className="mb-5 font-body text-xs text-ink-500">{p.confirmIntro}</p>
          <ul className="space-y-3 font-body text-xs leading-relaxed text-ink-600">
            <li>
              {p.c1pre}
              {p.c1link}
              {p.c1post}
            </li>
            <li>
              {p.c2pre}
              <SizeGuide label={p.c2link} icon={false} className="text-primary underline" />
              {p.c2post}
            </li>
            <li>{p.c3}</li>
            <li>{p.c4}</li>
          </ul>
          <Link
            to="/reservation"
            className="mt-8 inline-flex h-14 items-center justify-center bg-ink-800 px-8 font-headline text-[11px] uppercase tracking-crown text-primary-foreground transition-colors duration-300 hover:bg-primary"
          >
            {t.nav.reserver}
          </Link>
        </div>
      </section>
    </div>
  );
}
