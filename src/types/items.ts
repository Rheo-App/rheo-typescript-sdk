import type { DomainObject, RheoItemStatus, RheoItemType } from './common.js'

export interface UpsertItemRequest {
  title?: string
  description?: string
  /** Required for `type: 'item'`; ignored (defaults to 0) for `type: 'container'`. */
  price?: number
  shippingCost?: number
  imageUrls?: string[]
  domain?: DomainObject
  /** Semver schema version for the domain payload. Defaults to "1.0.0" if omitted. */
  schemaVersion?: string
  /** Links this item to a parent container (e.g. the donor vehicle's external id). The parent must already exist. */
  parentExternalId?: string
  /** `item` (default, sellable) or `container` (non-sellable grouping node, e.g. a donor vehicle). */
  type?: RheoItemType
  /** Arbitrary integrator key/value pairs. Stored and returned verbatim. Max 50 keys, 1 KB per value. */
  metadata?: Record<string, unknown>
  autoPublishTradera?: boolean
  useAiEnhancement?: boolean
  weightKg?: number
  currency?: string
  /**
   * How this item is shipped. Defaults to `integrated` (Rheo arranges shipping; buyer pays actual)
   * when omitted. Use `seller_shipped` for heavy/freight parts you ship on your own carrier account
   * and then report a tracking number via `client.orders.submitTracking(...)`; `fixed` (with a
   * `shippingCost`) for a flat fee Rheo collects; `pickup_only` for collection-only.
   * Note: `integrated` needs `weightKg` to compute a rate — without it the item resolves to pickup-only.
   */
  shippingStrategy?: 'integrated' | 'seller_shipped' | 'fixed' | 'pickup_only'
}

export interface UpsertItemResponse {
  success: boolean
  itemId: string
  message: string
}

export interface ItemStatusResponse {
  externalId: string
  rheoItemId: string
  rheoStatus?: RheoItemStatus
  traderaStatus?: string
  traderaAdId?: string
  traderaAdUrl?: string
  price?: number
}

export interface UpdatePriceRequest {
  price: number
}

export interface UpdateStatusRequest {
  status: 'sold' | 'not_listed'
}

export interface BatchUpsertItem extends UpsertItemRequest {
  externalId: string
}

export interface BatchUpsertRequest {
  items: BatchUpsertItem[]
}

export interface BatchUpsertError {
  externalId: string
  reason: string
}

export interface BatchUpsertResponse {
  accepted: number
  rejected: number
  errors: BatchUpsertError[]
}

export interface ListItemsParams {
  status?: RheoItemStatus
  parentExternalId?: string
  updatedSince?: string | Date
  /** Page size, default 100, max 1000. */
  limit?: number
  /** Opaque cursor from a previous response's `nextCursor`. */
  cursor?: string
}

export interface ListItem {
  externalId?: string
  rheoItemId: string
  status?: RheoItemStatus
  price?: number
  title?: string
  type: RheoItemType
  parentExternalId?: string
  metadata?: Record<string, unknown>
  traderaAdId?: string
  traderaAdUrl?: string
  updatedAt: string
}

export interface ItemListResponse {
  items: ListItem[]
  /** Pass back as `cursor` to fetch the next page. Null when there are no more. */
  nextCursor?: string
  /** Total rows matching the filters (ignores cursor/limit). */
  total: number
}

/** Aggregate over a container's direct children (the summary endpoint). */
export interface ItemSummaryResponse {
  externalId: string
  childCount: number
  activeCount: number
  soldCount: number
  draftCount: number
  /** Sum of marketplace price across active (listed) children. */
  listedValue: number
  /** Sum of marketplace price across sold children (approximate gross). */
  soldValue: number
  currency: string
}

/** One lifecycle milestone in an item's history. */
export interface ItemHistoryEvent {
  /** e.g. item.created, item.images_ready, price.updated, listing.created, item.sold, item.unlisted. */
  eventType: string
  /** Event-specific detail, verbatim (e.g. { price }, { imagesProcessed }, { traderaAdId }). */
  data?: Record<string, unknown>
  createdAt: string
}

export interface ItemHistoryResponse {
  externalId: string
  rheoItemId: string
  count: number
  /** Newest first. */
  events: ItemHistoryEvent[]
}

/** One child item under a container (e.g. a part under a donor vehicle). */
export interface ChildItem {
  externalId?: string
  rheoItemId: string
  title?: string
  status?: RheoItemStatus
  price?: number
  type: RheoItemType
}

export interface ItemChildrenResponse {
  parentExternalId: string
  count: number
  children: ChildItem[]
}
