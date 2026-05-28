// Webhook event types — typed mirror of the payloads Rheo POSTs to your webhook
// endpoints (rheo-market/src/worker/handlers/integration.rs). The envelope is
// { eventId, eventType, timestamp, data } and every `data` carries the shared
// fields below plus an additive `account` object; per-event fields are merged in.

/**
 * Identifies which Rheo account an event belongs to. `rheoUserId` is always the
 * owning account. `memberExternalId` is present only when the event is delivered
 * to a reseller endpoint (`scope='members'`) — it is the reseller's own reference
 * for the member, so one reseller endpoint can route the event to the right yard.
 */
export interface EventAccount {
  rheoUserId: string
  memberExternalId?: string
}

interface BaseEvent {
  /** Unique event id, e.g. `evt_…`. Use it to deduplicate (at-least-once delivery). */
  eventId: string
  /** RFC3339 timestamp of when the event was emitted. */
  timestamp: string
}

/** Fields present on every event `data` object. */
export interface EventData {
  /** The integrator's external id for the item (unchanged across all events). */
  externalId: string
  /** Rheo's internal item UUID. */
  rheoItemId: string
  /** Origin platform, e.g. `tradera`, `rheo`, `rheo_stripe`, `rheo_swish`. */
  platform: string
  /** Sale price in SEK. `0` for non-sale events. */
  salePrice: number
  currency: string
  account?: EventAccount
}

/** A new item (or container) was created via the integration API. */
export interface ItemCreatedEvent extends BaseEvent {
  eventType: 'item.created'
  data: EventData & { type?: 'item' | 'container' }
}

/** Background image processing finished for an item. */
export interface ItemImagesReadyEvent extends BaseEvent {
  eventType: 'item.images_ready'
  data: EventData & { imagesProcessed?: number }
}

/** A Tradera auction goes live. */
export interface ListingCreatedEvent extends BaseEvent {
  eventType: 'listing.created'
  data: EventData & { traderaAdId?: string; traderaAdUrl?: string }
}

/** A Tradera auction closed without a winning bid. */
export interface ListingEndedEvent extends BaseEvent {
  eventType: 'listing.ended'
  data: EventData & { traderaAdId?: string }
}

/** Rheo could not publish the Tradera listing. `error` describes the cause. */
export interface ListingFailedEvent extends BaseEvent {
  eventType: 'listing.failed'
  data: EventData & { error?: string }
}

/** The item sold (Tradera hammer price, or a direct Rheo sale). */
export interface ItemSoldEvent extends BaseEvent {
  eventType: 'item.sold'
  data: EventData & { traderaAdId?: string }
}

export type RheoEvent =
  | ItemCreatedEvent
  | ItemImagesReadyEvent
  | ListingCreatedEvent
  | ListingEndedEvent
  | ListingFailedEvent
  | ItemSoldEvent

/** The string literal union of all event types Rheo delivers. */
export type RheoEventType = RheoEvent['eventType']
