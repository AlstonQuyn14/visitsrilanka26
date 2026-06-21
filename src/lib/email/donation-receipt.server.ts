// Sends a branded donation receipt email via Lovable Emails.
//
// This is wired up once the project's email domain + email infrastructure are
// configured. Until then it throws, and the webhook treats the receipt as a
// best-effort no-op (the payment provider still sends its own order receipt).

export interface DonationReceiptParams {
  email: string;
  donorName?: string;
  causeName: string;
  amountFormatted: string;
  transactionId: string;
}

export async function sendDonationReceiptEmail(
  _params: DonationReceiptParams,
): Promise<void> {
  throw new Error("Email infrastructure not configured yet");
}
