import type { OrderStatus } from "./orderStatus";

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

interface ContactMessage {
  name: string;
  email: string;
  message: string;
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
  const labels: Record<OrderStatus, string> = {
    Pending: "reçue",
    Confirmed: "confirmée",
    Preparing: "en préparation",
    Ready: "prête",
    Shipped: "expédiée",
    Delivered: "livrée",
    Cancelled: "annulée",
  };
  return `Votre commande ${order.orderRef} est ${labels[status]}`;
}

function buildHtml(order: OrderEmailOrder, status: OrderStatus): string {
  const heading = ({
    Pending: "Nous avons bien reçu votre commande",
    Confirmed: "Votre commande est confirmée",
    Preparing: "Votre commande est en préparation",
    Ready: "Votre commande est prête",
    Shipped: "Votre commande est en route",
    Delivered: "Votre commande a été livrée",
    Cancelled: "Votre commande a été annulée",
  } satisfies Record<OrderStatus, string>)[status];

  const statusMessage = ({
    Pending: "Merci pour votre confiance. Notre équipe a bien reçu votre commande et la prépare avec soin.",
    Confirmed: "Votre commande est confirmée. Notre équipe la prépare avec soin. Merci de votre patience.",
    Preparing: "Votre commande est en cours de préparation. Notre équipe veille à chaque détail.",
    Ready: "Votre commande est prête. Notre équipe vous remercie pour votre confiance.",
    Shipped: "Votre commande a été expédiée et est en route vers vous.",
    Delivered: "Votre commande a été livrée. Nous espérons que vos articles vous plaisent.",
    Cancelled: "Votre commande a été annulée. Contactez notre équipe si vous avez des questions.",
  } satisfies Record<OrderStatus, string>)[status];

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.productName)}
            <div style="font-size:12px;color:#888;">
              ${item.color ? `Couleur : ${escapeHtml(item.color)} &middot; ` : ""}Taille : ${escapeHtml(item.size)} &middot; Qté : ${item.quantity}
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
                  Bonjour ${escapeHtml(order.customerName)},
                </p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">${statusMessage}</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">
                  Référence de commande : <strong>${escapeHtml(order.orderRef)}</strong>
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                  <tr>
                    <td style="padding:12px 0;font-size:14px;">
                      <strong>Total : ${escapeHtml(order.totalAmount)}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888;line-height:1.6;">
                Merci pour votre confiance.<br />
                L’équipe Aighis Byrca reste à votre disposition pour toute question.
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
        reply_to: process.env.RESEND_REPLY_TO_EMAIL || undefined,
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

export async function sendContactMessage(
  message: ContactMessage
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || FROM_FALLBACK;
  const recipient = "aighisbyrca@gmail.com";

  if (!apiKey || !recipient) {
    return { sent: false, reason: "Contact email delivery is not configured" };
  }

  const escapedName = escapeHtml(message.name);
  const escapedEmail = escapeHtml(message.email);
  const escapedMessage = escapeHtml(message.message).replace(/\r?\n/g, "<br />");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: message.email,
        subject: "New website contact message",
        html: `<h2>New contact message</h2><p><strong>Name:</strong> ${escapedName}</p><p><strong>Email:</strong> ${escapedEmail}</p><p>${escapedMessage}</p>`,
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: `Resend responded ${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
