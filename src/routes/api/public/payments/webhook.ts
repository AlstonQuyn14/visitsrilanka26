import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

function centsToAmountString(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

async function sendDonationReceipt(params: {
  email: string;
  donorName?: string;
  causeName: string;
  amountФormatted: string;
  transactionId: string;
}) {
  // Best-effort branded receipt via Lovable Emails. Safe no-op until email
  // infrastructure + templates are configured for the project.
  try {
    const { sendDonationReceiptEmail } = await import(
      "@/lib/email/donation-receipt.server"
    );
    await sendDonationReceiptEmail(params);
    return true;
  } catch (e) {
    console.warn("Donation receipt email skipped:", (e as Error)?.message);
    return false;
  }
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const custom = data.customData || {};
  const causeId = custom.causeId || "general";
  const causeName = custom.causeName || "Growth of Sri Lanka";
  const userId = custom.userId || null;
  const donorName = custom.donorName || null;
  const donorEmail = custom.donorEmail || null;

  const amountCents = parseInt(data.details?.totals?.grandTotal ?? "0", 10);
  const currency = data.currencyCode || "USD";

  const { error } = await getSupabase()
    .from("donations")
    .upsert(
      {
        user_id: userId,
        cause_id: causeId,
        cause_name: causeName,
        amount_cents: amountCents,
        currency,
        donor_name: donorName,
        donor_email: donorEmail,
        status: "completed",
        paddle_transaction_id: data.id,
        environment: env,
      },
      { onConflict: "paddle_transaction_id" },
    );

  if (error) {
    console.error("Failed to record donation:", error.message);
    return;
  }

  if (donorEmail) {
    const sent = await sendDonationReceipt({
      email: donorEmail,
      donorName: donorName ?? undefined,
      causeName,
      amountФormatted: centsToAmountString(amountCents, currency),
      transactionId: data.id,
    });
    if (sent) {
      await getSupabase()
        .from("donations")
        .update({ receipt_sent: true })
        .eq("paddle_transaction_id", data.id);
    }
  }
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    default:
      console.log("Unhandled event:", event.eventType);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
