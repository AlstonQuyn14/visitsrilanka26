// Sends a booking-notification email to the operations team (e.g. the
// transport desk) so they can dispatch a paid ride.
//
// This is wired up once the project's email domain + email infrastructure are
// configured. Until then it throws, and the webhook treats the notice as a
// best-effort no-op (the paid order is still recorded in the database and is
// visible in the payments dashboard).

export interface OperatorBookingParams {
  opsEmail: string;
  itemName: string;
  orderType: string;
  amountFormatted: string;
  customerName?: string;
  customerEmail?: string;
  details: Record<string, string>;
  transactionId: string;
}

export async function sendOperatorBookingEmail(
  _params: OperatorBookingParams,
): Promise<void> {
  throw new Error("Email infrastructure not configured yet");
}
