import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, PaymentError, verifyCheckoutSession } from "@/lib/payments.server";

export const Route = createFileRoute("/api/stripe/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
          return jsonResponse(await verifyCheckoutSession(sessionId));
        } catch (error) {
          const status = error instanceof PaymentError ? error.status : 500;
          if (status >= 500) console.error("[stripe-session] verification failed", error);
          return jsonResponse({ error: error instanceof PaymentError ? error.message : "Payment status is temporarily unavailable. Please try again later." }, status);
        }
      },
    },
  },
});
