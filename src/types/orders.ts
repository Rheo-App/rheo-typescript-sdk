/**
 * Submit a tracking number for an order you ship yourself.
 *
 * Used only for items synced with `shippingStrategy: 'seller_shipped'` — heavy/freight
 * parts the yard ships on its own carrier account. Rheo relays the tracking to the buyer
 * and releases the payout against it. You receive the `orderId` on the `item.sold` webhook.
 */
export interface SellerTrackingRequest {
  /** Carrier name, e.g. `postnord`, `dhl`, `schenker`. */
  carrier: string
  /** The carrier's tracking number for the shipment. */
  trackingNumber: string
}

export interface SellerTrackingResponse {
  /** Rheo's shipment id (UUID) for the tracked parcel. */
  shipmentId: string
  trackingNumber: string
  carrier: string
}
