import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { Items } from './resources/items.js'
import { Orders } from './resources/orders.js'
import { Webhooks } from './resources/webhooks.js'
import { RheoApiError, RheoRateLimitError } from './errors.js'

export interface RheoClientOptions {
  apiKey: string
  webhookSecret?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  partnerAccount?: string
}

const DEFAULT_BASE_URL = 'https://market.rheo.se'
const DEFAULT_TIMEOUT = 30_000
const DEFAULT_MAX_RETRIES = 3

export class RheoClient {
  readonly items: Items
  readonly orders: Orders
  readonly webhooks: Webhooks
  private readonly http: AxiosInstance

  constructor(options: RheoClientOptions) {
    this.http = axios.create({
      baseURL: options.baseUrl ?? DEFAULT_BASE_URL,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      headers: {
        'x-api-key': options.apiKey,
        'content-type': 'application/json',
        ...(options.partnerAccount
          ? { 'x-partner-account': options.partnerAccount }
          : {}),
      },
    })

    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
    this.http.interceptors.response.use(
      undefined,
      makeRetryInterceptor(this.http, maxRetries),
    )
    this.http.interceptors.response.use(undefined, mapErrorInterceptor)

    this.items = new Items(this.http)
    this.orders = new Orders(this.http)
    this.webhooks = new Webhooks(options.webhookSecret)
  }
}

interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
}

function makeRetryInterceptor(http: AxiosInstance, maxRetries: number) {
  return async (error: any): Promise<any> => {
    const config = error.config as RetryConfig | undefined
    if (!config) return Promise.reject(error)

    const retryCount = config.__retryCount ?? 0
    const status: number | undefined = error.response?.status
    const isRetryable = status === 429 || (status !== undefined && status >= 500)

    if (!isRetryable || retryCount >= maxRetries) {
      return Promise.reject(error)
    }

    config.__retryCount = retryCount + 1

    const retryAfterHeader: string | undefined = error.response?.headers?.['retry-after']
    const backoff = retryAfterHeader
      ? parseInt(retryAfterHeader, 10) * 1000
      : Math.min(200 * 2 ** retryCount, 10_000)

    await sleep(backoff)
    return http(config)
  }
}

function mapErrorInterceptor(error: any): never {
  const status: number | undefined = error.response?.status
  const body = error.response?.data as Record<string, unknown> | undefined
  const requestId = error.response?.headers?.['x-request-id'] as string | undefined

  if (status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'] as string | undefined
    throw new RheoRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined)
  }

  if (status !== undefined) {
    const message =
      (body?.['message'] as string | undefined) ??
      (body?.['error'] as string | undefined) ??
      `HTTP ${status}`
    throw new RheoApiError(message, status, body?.['code'] as string | undefined, requestId)
  }

  throw error
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
