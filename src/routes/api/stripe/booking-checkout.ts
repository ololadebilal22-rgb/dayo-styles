import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, PaymentError, startBookingCheckout } from "@/lib/payments.server";

export const Route = createFileRoute("/api/stripe/booking-checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return jsonResponse(await startBookingCheckout(request));
        } catch (error) {
          const status = error instanceof PaymentError ? error.status : 500;
          if (status >= 500) console.error("[booking-checkout] failed", error);
          return jsonResponse({ error: error instanceof PaymentError ? error.message : "Checkout is temporarily unavailable. Please try again later." }, status);
        }
      },
    },
  },
});
