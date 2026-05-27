import { createHmac, timingSafeEqual } from 'crypto'
import { RheoWebhookSignatureError } from '../errors.js'
import type { RheoEvent } from '../types/events.js'

export class Webhooks {
  constructor(private readonly secret?: string) {}

  verify(payload: string | Buffer, signature: string): RheoEvent {
    if (!this.secret) {
      throw new RheoWebhookSignatureError(
        'webhookSecret must be provided to RheoClient to verify webhook signatures',
      )
    }

    const raw = signature.startsWith('sha256=') ? signature.slice(7) : signature

    const expected = createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex')

    const sigBuffer = Buffer.from(raw, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
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
  fromRequest(req: any): RheoEvent {
    const signature = req.headers?.['x-rheo-signature'] as string | undefined
    if (!signature) {
      throw new RheoWebhookSignatureError('Missing X-Rheo-Signature header')
    }
    return this.verify(req.rawBody ?? req.body, signature)
  }
}
