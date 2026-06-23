import type { AxiosInstance } from 'axios'
import { requestConfig, type RequestOptions } from './items.js'
import type { SellerTrackingRequest, SellerTrackingResponse } from '../types/orders.js'

export class Orders {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Report a tracking number for an order you shipped yourself (items synced with
   * `shippingStrategy: 'seller_shipped'`). Rheo relays it to the buyer and releases
   * the payout against it. `orderId` arrives on the `item.sold` webhook.
   */
  async submitTracking(
    orderId: string,
    data: SellerTrackingRequest,
    opts?: RequestOptions,
  ): Promise<SellerTrackingResponse> {
    const { data: res } = await this.http.post<SellerTrackingResponse>(
      `/integration/v1/orders/${encodeURIComponent(orderId)}/tracking`,
      data,
      requestConfig(opts),
    )
    return res
  }
}
