import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/manifest")({
  server: {
    handlers: {
      GET: async () => Response.json(
        {
          name: "Dayo Styles",
          short_name: "Dayo Styles",
          id: "/",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#f6efe7",
          theme_color: "#110d08",
          icons: [{ src: "/__grok/icon-180.png", sizes: "180x180", type: "image/png" }],
        },
        { headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "no-cache" } },
      ),
    },
  },
});
