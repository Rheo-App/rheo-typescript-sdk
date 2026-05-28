import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type {
  BatchUpsertRequest,
  BatchUpsertResponse,
  ItemChildrenResponse,
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

/**
 * Per-call request options. `partnerAccount` routes a single call to a reseller
 * sub-account by setting the `x-partner-account` header for that request only,
 * overriding any client-level `partnerAccount`. The value is the reseller's
 * `external_id` for the member (from `reseller_memberships`) — i.e. the reference
 * set in the business "Managed accounts" UI.
 */
export interface RequestOptions {
  partnerAccount?: string
}

function requestConfig(
  opts?: RequestOptions,
  base?: AxiosRequestConfig,
): AxiosRequestConfig | undefined {
  if (!opts?.partnerAccount) return base
  return {
    ...base,
    headers: { ...base?.headers, 'x-partner-account': opts.partnerAccount },
  }
}

export class Items {
  constructor(private readonly http: AxiosInstance) {}

  async upsert(
    externalId: string,
    data: UpsertItemRequest,
    opts?: RequestOptions,
  ): Promise<UpsertItemResponse> {
    const { data: res } = await this.http.put<UpsertItemResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}`,
      data,
      requestConfig(opts),
    )
    return res
  }

  async get(externalId: string, opts?: RequestOptions): Promise<ItemStatusResponse> {
    const { data } = await this.http.get<ItemStatusResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}`,
      requestConfig(opts),
    )
    return data
  }

  async delete(externalId: string, opts?: RequestOptions): Promise<void> {
    await this.http.delete(
      `/integration/v1/items/${encodeURIComponent(externalId)}`,
      requestConfig(opts),
    )
  }

  async updatePrice(
    externalId: string,
    data: UpdatePriceRequest,
    opts?: RequestOptions,
  ): Promise<void> {
    await this.http.patch(
      `/integration/v1/items/${encodeURIComponent(externalId)}/price`,
      data,
      requestConfig(opts),
    )
  }

  async updateStatus(
    externalId: string,
    data: UpdateStatusRequest,
    opts?: RequestOptions,
  ): Promise<void> {
    await this.http.patch(
      `/integration/v1/items/${encodeURIComponent(externalId)}/status`,
      data,
      requestConfig(opts),
    )
  }

  async batchUpsert(
    data: BatchUpsertRequest,
    opts?: RequestOptions,
  ): Promise<BatchUpsertResponse> {
    const { data: res } = await this.http.post<BatchUpsertResponse>(
      '/integration/v1/items/batch',
      data,
      requestConfig(opts),
    )
    return res
  }

  async list(params?: ListItemsParams, opts?: RequestOptions): Promise<ItemListResponse> {
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

    const { data } = await this.http.get<ItemListResponse>(
      '/integration/v1/items',
      requestConfig(opts, { params: query }),
    )
    return data
  }

  async summary(externalId: string, opts?: RequestOptions): Promise<ItemSummaryResponse> {
    const { data } = await this.http.get<ItemSummaryResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}/summary`,
      requestConfig(opts),
    )
    return data
  }

  async history(externalId: string, opts?: RequestOptions): Promise<ItemHistoryResponse> {
    const { data } = await this.http.get<ItemHistoryResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}/history`,
      requestConfig(opts),
    )
    return data
  }

  /** Lists the child items under a container (e.g. parts under a donor vehicle). */
  async children(externalId: string, opts?: RequestOptions): Promise<ItemChildrenResponse> {
    const { data } = await this.http.get<ItemChildrenResponse>(
      `/integration/v1/items/${encodeURIComponent(externalId)}/children`,
      requestConfig(opts),
    )
    return data
  }
}
