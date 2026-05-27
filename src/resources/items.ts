import type { AxiosInstance } from 'axios'
import type {
  BatchUpsertRequest,
  BatchUpsertResponse,
  HistoryEntry,
  ItemHistoryResponse,
  ItemListResponse,
  ItemStatusResponse,
  ItemSummaryResponse,
  ListItemsParams,
  UpdatePriceRequest,
  UpdateStatusRequest,
  UpsertItemRequest,
  UpsertItemResponse,
} from '../types/items.js'

export class Items {
  constructor(private readonly http: AxiosInstance) {}

  async upsert(externalId: string, data: UpsertItemRequest): Promise<UpsertItemResponse> {
    const { data: res } = await this.http.put<UpsertItemResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}`,
      data,
    )
    return res
  }

  async get(externalId: string): Promise<ItemStatusResponse> {
    const { data } = await this.http.get<ItemStatusResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}`,
    )
    return data
  }

  async delete(externalId: string): Promise<void> {
    await this.http.delete(`/integration/v1/items/${encodeURIComponent(externalId)}`)
  }

  async updatePrice(externalId: string, data: UpdatePriceRequest): Promise<void> {
    await this.http.patch(
      `/integration/v1/items/${encodeURIComponent(externalId)}/price`,
      data,
    )
  }

  async updateStatus(externalId: string, data: UpdateStatusRequest): Promise<void> {
    await this.http.patch(
      `/integration/v1/items/${encodeURIComponent(externalId)}/status`,
      data,
    )
  }

  async batchUpsert(data: BatchUpsertRequest): Promise<BatchUpsertResponse> {
    const { data: res } = await this.http.post<BatchUpsertResponse>(
      '/integration/v1/items/batch',
      data,
    )
    return res
  }

  async list(params?: ListItemsParams): Promise<ItemListResponse> {
    const query: Record<string, string | number> = {}
    if (params?.status) query['status'] = params.status
    if (params?.parentExternalId) query['parent_external_id'] = params.parentExternalId
    if (params?.updatedSince) {
      query['updated_since'] =
        params.updatedSince instanceof Date
          ? params.updatedSince.toISOString()
          : params.updatedSince
    }
    if (params?.limit !== undefined) query['limit'] = params.limit
    if (params?.cursor) query['cursor'] = params.cursor

    const { data } = await this.http.get<ItemListResponse>('/integration/v1/items', {
      params: query,
    })
    return data
  }

  async summary(externalId: string): Promise<ItemSummaryResponse> {
    const { data } = await this.http.get<ItemSummaryResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}/summary`,
    )
    return data
  }

  async history(externalId: string): Promise<ItemHistoryResponse> {
    const { data } = await this.http.get<ItemHistoryResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}/history`,
    )
    return data
  }
}
