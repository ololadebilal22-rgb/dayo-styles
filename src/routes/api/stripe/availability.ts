import { createFileRoute } from "@tanstack/react-router";
import { getBookingAvailability, jsonResponse, PaymentError } from "@/lib/payments.server";

export const Route = createFileRoute("/api/stripe/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const date = new URL(request.url).searchParams.get("date") ?? "";
          return jsonResponse(await getBookingAvailability(date));
        } catch (error) {
          const status = error instanceof PaymentError ? error.status : 500;
          if (status >= 500) console.error("[booking-availability] failed", error);
          return jsonResponse({ error: error instanceof PaymentError ? error.message : "Availability is temporarily unavailable. Please try again later." }, status);
        }
      },
    },
  },
});
