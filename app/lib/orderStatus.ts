export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DEFAULT_ORDER_STATUS: OrderStatus = "Pending";

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

/** Statuses that mean the order is still counting against stock. */
export const ACTIVE_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Shipped",
];

/** Statuses for which the customer gets an email. */
export const NOTIFY_STATUSES: OrderStatus[] = ["Ready", "Shipped"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Preparing: "Preparing",
  Ready: "Ready for pickup",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

export const STATUS_SEQUENCE: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Shipped",
  "Delivered",
];

/** Statuses that can never be changed again. */
export const TERMINAL_STATUSES: OrderStatus[] = ["Delivered", "Cancelled"];

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Admin friendly transition rules: any step forward is allowed, an active
 * order can be cancelled at any point, and a mistake can be corrected by
 * moving an active order back. Cancelled and Delivered are final because the
 * stock they released was either restocked or handed over.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  if (isTerminalStatus(from)) return false;
  return true;
}
