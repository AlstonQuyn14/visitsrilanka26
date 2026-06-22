import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

let _supabase: ReturnType<typeof createClient<any>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<any>(
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
  amountFormatted: string;
  transactionId: string;
}) {
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

async function sendOrderReceipt(params: {
  email: string;
  customerName?: string;
  itemName: string;
  orderType: string;
  amountFormatted: string;
  transactionId: string;
}) {
  try {
    const { sendOrderReceiptEmail } = await import(
      "@/lib/email/order-receipt.server"
    );
    await sendOrderReceiptEmail(params);
    return true;
  } catch (e) {
    console.warn("Order receipt email skipped:", (e as Error)?.message);
    return false;
  }
}

async function sendOperatorBookingNotice(params: {
  opsEmail: string;
  itemName: string;
  orderType: string;
  amountFormatted: string;
  customerName?: string;
  customerEmail?: string;
  details: Record<string, string>;
  transactionId: string;
}) {
  try {
    const { sendOperatorBookingEmail } = await import(
      "@/lib/email/operator-booking.server"
    );
    await sendOperatorBookingEmail(params);
    return true;
  } catch (e) {
    console.warn(
      "Operator booking notice skipped:",
      (e as Error)?.message,
    );
    return false;
  }
}

async function handleOrderCompleted(data: any, custom: any, env: PaddleEnv) {
  const userId = custom.userId || null;
  const orderType = custom.orderType || "order";
  const itemId = custom.itemId || null;
  const itemName = custom.itemName || "Booking";
  const customerName = custom.customerName || null;
  const customerEmail = custom.customerEmail || null;

  const amountCents = parseInt(data.details?.totals?.grandTotal ?? "0", 10);
  const currency = data.currencyCode || "USD";

  // Anything in customData beyond the known keys is stored as order metadata.
  const known = new Set([
    "kind",
    "userId",
    "orderType",
    "itemId",
    "itemName",
    "customerName",
    "customerEmail",
  ]);
  const metadata: Record<string, string> = {};
  for (const [k, v] of Object.entries(custom)) {
    if (!known.has(k)) metadata[k] = String(v);
  }

  const { error } = await getSupabase()
    .from("orders")
    .upsert(
      {
        user_id: userId,
        order_type: orderType,
        item_id: itemId,
        item_name: itemName,
        amount_cents: amountCents,
        currency,
        customer_name: customerName,
        customer_email: customerEmail,
        status: "completed",
        paddle_transaction_id: data.id,
        metadata,
        environment: env,
      },
      { onConflict: "paddle_transaction_id" },
    );

  if (error) {
    console.error("Failed to record order:", error.message);
    return;
  }

  if (customerEmail) {
    const sent = await sendOrderReceipt({
      email: customerEmail,
      customerName: customerName ?? undefined,
      itemName,
      orderType,
      amountFormatted: centsToAmountString(amountCents, currency),
      transactionId: data.id,
    });
    if (sent) {
      await getSupabase()
        .from("orders")
        .update({ receipt_sent: true })
        .eq("paddle_transaction_id", data.id);
    }
  }

  // Notify the operations inbox so the team can dispatch the paid booking.
  const opsEmail = metadata.opsEmail;
  if (opsEmail) {
    await sendOperatorBookingNotice({
      opsEmail,
      itemName,
      orderType,
      amountFormatted: centsToAmountString(amountCents, currency),
      customerName: customerName ?? undefined,
      customerEmail: customerEmail ?? undefined,
      details: metadata,
      transactionId: data.id,
    });
  }
}

async function handleDonationCompleted(data: any, custom: any, env: PaddleEnv) {
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
      amountFormatted: centsToAmountString(amountCents, currency),
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

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const custom = data.customData || {};
  // Subscription transactions are handled by the subscription.* events.
  if (custom.kind === "subscription") return;
  if (custom.kind === "order") {
    await handleOrderCompleted(data, custom, env);
    return;
  }
  // Default: donations (the original Support a Cause flow).
  await handleDonationCompleted(data, custom, env);
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } =
    data;
  const userId = customData?.userId;
  if (!userId) {
    console.error("No userId in subscription customData");
    return;
  }
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn("Skipping subscription: missing importMeta.externalId", {
      rawPriceId: item?.price?.id,
      rawProductId: item?.product?.id,
    });
    return;
  }

  await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        paddle_subscription_id: id,
        paddle_customer_id: customerId,
        product_id: productId,
        price_id: priceId,
        status,
        current_period_start: currentBillingPeriod?.startsAt,
        current_period_end: currentBillingPeriod?.endsAt,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paddle_subscription_id" },
    );
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;
  await getSupabase()
    .from("subscriptions")
    .update({
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === "cancel",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", id)
    .eq("environment", env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("paddle_subscription_id", data.id)
    .eq("environment", env);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
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
