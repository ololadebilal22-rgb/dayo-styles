import { createFileRoute } from "@tanstack/react-router";
import { handleStripeWebhook, jsonResponse, PaymentError } from "@/lib/payments.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return jsonResponse(await handleStripeWebhook(request));
        } catch (error) {
          const status = error instanceof PaymentError ? error.status : 500;
          if (status >= 500) console.error("[stripe-webhook] failed", error);
          return jsonResponse({ error: error instanceof PaymentError ? error.message : "Webhook processing failed." }, status);
        }
      },
    },
  },
});
