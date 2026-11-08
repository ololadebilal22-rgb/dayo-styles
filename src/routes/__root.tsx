import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LanguageProvider } from "@/lib/lang";
import { SiteFrame } from "@/components/shell";
import appCss from "../styles.css?url";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Manrope:wght@300;400;500;700&display=swap";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dayo Styles · Braiding Salon in Toronto" },
      {
        name: "description",
        content:
          "Dayo Styles is a high-end braiding salon in North York (2020 Sheppard Ave W). Knotless braids, box braids, French curl, boho braids, passion & marley twists, soft locs, cornrows and sew-ins — hand-finished, every time.",
      },
      { name: "theme-color", content: "#110D08" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/brand-favicon.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS },
      { rel: "manifest", href: "/api/manifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden bg-background font-body text-foreground antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <LanguageProvider>
            <SiteFrame>
              <Outlet />
            </SiteFrame>
          </LanguageProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
