import { createHmac, timingSafeEqual } from 'crypto'
import { RheoWebhookSignatureError } from '../errors.js'
import type { RheoEvent } from '../types/events.js'

export class Webhooks {
  constructor(private readonly secret?: string) {}

  /**
   * Verify a webhook signature and return the parsed event.
   *
   * `secret` overrides the client-level `webhookSecret` for this call. With
   * multiple webhook endpoints, each endpoint has its OWN signing secret —
   * verify with the secret of the endpoint that received the event. Pass an
   * array to accept any of several secrets (handy during secret rotation).
   */
  verify(
    payload: string | Buffer,
    signature: string,
    secret?: string | string[],
  ): RheoEvent {
    const secrets = this.resolveSecrets(secret)

    const raw = signature.startsWith('sha256=') ? signature.slice(7) : signature
    const sigBuffer = Buffer.from(raw, 'hex')

    const matches = secrets.some((s) => {
      const expected = createHmac('sha256', s).update(payload).digest('hex')
      const expectedBuffer = Buffer.from(expected, 'hex')
      return (
        sigBuffer.length === expectedBuffer.length &&
        timingSafeEqual(sigBuffer, expectedBuffer)
      )
    })

    if (!matches) {
      throw new RheoWebhookSignatureError()
    }

    const body = typeof payload === 'string' ? payload : payload.toString('utf8')
    return JSON.parse(body) as RheoEvent
  }

  parseEvent(payload: string | object): RheoEvent {
    if (typeof payload === 'string') {
      return JSON.parse(payload) as RheoEvent
    }
    return payload as RheoEvent
  }

  middleware() {
    // Express/Connect middleware — buffers the raw body for HMAC verification
    return (req: any, _res: any, next: any) => {
      if (req.rawBody) {
        // body-parser already buffered raw body
        return next()
      }

      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', () => {
        req.rawBody = Buffer.concat(chunks)
        next()
      })
      req.on('error', next)
    }
  }

  // Call after middleware() to verify and parse the event.
  // Pass `secret` to verify with the secret of the endpoint that received it.
  fromRequest(req: any, secret?: string | string[]): RheoEvent {
    const signature = req.headers?.['x-rheo-signature'] as string | undefined
    if (!signature) {
      throw new RheoWebhookSignatureError('Missing X-Rheo-Signature header')
    }
    return this.verify(req.rawBody ?? req.body, signature, secret)
  }

  private resolveSecrets(override?: string | string[]): string[] {
    const source = override ?? this.secret
    if (source === undefined) {
      throw new RheoWebhookSignatureError(
        'A webhook secret must be provided (RheoClient webhookSecret or the secret argument) to verify webhook signatures',
      )
    }
    const list = (Array.isArray(source) ? source : [source]).filter((s) => s.length > 0)
    if (list.length === 0) {
      throw new RheoWebhookSignatureError(
        'No non-empty webhook secret provided to verify webhook signatures',
      )
    }
    return list
  }
}
