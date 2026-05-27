import type { DomainObject, RheoItemStatus, RheoItemType } from './common.js'

export interface UpsertItemRequest {
  title?: string
  description?: string
  price?: number
  shippingCost?: number
  imageUrls?: string[]
  domain?: DomainObject
  parentExternalId?: string
  type?: RheoItemType
  metadata?: Record<string, unknown>
  autoPublishTradera?: boolean
  useAiEnhancement?: boolean
  weightKg?: number
  currency?: string
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
  limit?: number
  cursor?: string
}

export interface ItemListResponse {
  items: ItemStatusResponse[]
  nextCursor?: string
  total: number
}

export interface ItemSummaryResponse {
  externalId: string
  title: string
  children: {
    total: number
    byStatus: Partial<Record<RheoItemStatus, number>>
  }
  revenue: {
    totalSek: number
    pendingListedSek: number
  }
}

export interface HistoryEntry {
  at: string
  event: string
  actor?: string
  [key: string]: unknown
}

export interface ItemHistoryResponse {
  externalId: string
  history: HistoryEntry[]
}
