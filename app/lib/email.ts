import { STATUS_LABELS, type OrderStatus } from "./orderStatus";

interface OrderEmailOrder {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  items: {
    productName: string;
    size: string;
    color: string | null;
    quantity: number;
  }[];
}

export interface SendResult {
  sent: boolean;
  reason?: string;
}

const FROM_FALLBACK = "Aighis Byrca <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSubject(order: OrderEmailOrder, status: OrderStatus): string {
  switch (status) {
    case "Ready":
      return `Your Aighis Byrca order ${order.orderRef} is ready`;
    case "Shipped":
      return `Your Aighis Byrca order ${order.orderRef} has shipped`;
    default:
      return `Order ${order.orderRef} — ${STATUS_LABELS[status]}`;
  }
}

function buildHtml(order: OrderEmailOrder, status: OrderStatus): string {
  const heading =
    status === "Ready"
      ? "Your order is ready"
      : "Your order is on its way";

  const intro =
    status === "Ready"
      ? "Good news — your order is packed and ready. You can now come pick it up or arrange delivery with us."
      : "Good news — your order has left us and is on its way to you.";

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.productName)}
            <div style="font-size:12px;color:#888;">
              ${item.color ? `Color: ${escapeHtml(item.color)} &middot; ` : ""}Size: ${escapeHtml(item.size)} &middot; Qty: ${item.quantity}
            </div>
          </td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f7f6f4;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #eee;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #eee;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#888;">Aighis Byrca</div>
                <h1 style="margin:12px 0 0;font-size:22px;font-weight:500;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
                  Hello ${escapeHtml(order.customerName)},
                </p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">${intro}</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">
                  Order reference: <strong>${escapeHtml(order.orderRef)}</strong>
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                  <tr>
                    <td style="padding:12px 0;font-size:14px;">
                      <strong>Total: ${escapeHtml(order.totalAmount)}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888;line-height:1.6;">
                Free shipping on all orders within Tunisia. Delivery within 2-4 business days.<br />
                Free returns within 14 days of delivery.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends through the Resend HTTP API so no SDK dependency is required.
 * Missing configuration is not an error: the caller still completes the
 * status change and simply reports that no email was sent.
 */
export async function sendOrderStatusEmail(
  order: OrderEmailOrder,
  status: OrderStatus
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  if (!order.customerEmail || !order.customerEmail.includes("@")) {
    return { sent: false, reason: "Customer has no valid email address" };
  }

  const from = process.env.RESEND_FROM_EMAIL || FROM_FALLBACK;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [order.customerEmail],
        subject: buildSubject(order, status),
        html: buildHtml(order, status),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { sent: false, reason: `Resend responded ${response.status}: ${detail}` };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
