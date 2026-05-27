export class RheoApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message)
    this.name = 'RheoApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class RheoRateLimitError extends RheoApiError {
  readonly retryAfter?: number

  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'rate_limit_exceeded')
    this.name = 'RheoRateLimitError'
    this.retryAfter = retryAfter
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class RheoWebhookSignatureError extends Error {
  constructor(message = 'Webhook signature verification failed') {
    super(message)
    this.name = 'RheoWebhookSignatureError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
