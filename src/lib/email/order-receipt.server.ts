// Sends a branded order confirmation email via Lovable Emails.
//
// This is wired up once the project's email domain + email infrastructure are
// configured. Until then it throws, and the webhook treats the receipt as a
// best-effort no-op (the payment provider still sends its own order receipt).

export interface OrderReceiptParams {
  email: string;
  customerName?: string;
  itemName: string;
  orderType: string;
  amountFormatted: string;
  transactionId: string;
}

export async function sendOrderReceiptEmail(
  _params: OrderReceiptParams,
): Promise<void> {
  throw new Error("Email infrastructure not configured yet");
}
