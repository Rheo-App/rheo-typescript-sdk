# rheo-sdk

Official TypeScript/Node.js SDK for the [Rheo](https://rheo.se) integration API.

Push inventory from your ERP or DMS to Tradera auctions. Receive typed webhook events when items sell.

```
npm install rheo-sdk
```

```
pnpm add rheo-sdk
```

```
bun add rheo-sdk
```

Requires Node.js 18+.

---

## Quick start

```typescript
import { RheoClient } from 'rheo-sdk'

const rheo = new RheoClient({
  apiKey: process.env.RHEO_API_KEY!,
  webhookSecret: process.env.RHEO_WEBHOOK_SECRET!,
})

// Push an item — Rheo downloads images and publishes to Tradera
await rheo.items.upsert('ERP_PART_12345', {
  title: 'Volvo XC90 bromsok fram vänster — 2018',
  price: 950,
  shippingCost: 149,
  imageUrls: ['https://cdn.example.com/parts/12345/1.jpg'],
  domain: {
    domain: 'auto_parts',
    vehicle: { manufacturer: 'Volvo', model: 'XC90', year: 2018, vehicleType: 'Bil' },
    part: { name: 'Bromsok fram vänster', oemNumber: '31400452' },
    conditionGrade: 'B',
  },
  autoPublishTradera: true,
})

// Check status
const item = await rheo.items.get('ERP_PART_12345')
console.log(item.traderaAdUrl)  // https://www.tradera.com/item/398271634

// Receive sale events
app.post('/webhooks/rheo', rheo.webhooks.middleware(), (req, res) => {
  const event = rheo.webhooks.fromRequest(req)
  if (event.eventType === 'item.sold') {
    console.log(`${event.data.externalId} sold for ${event.data.salePrice} SEK`)
  }
  res.sendStatus(200)
})
```

---

## Reseller routing (many accounts, one key)

If you manage several Rheo accounts under one reseller API key (e.g. a chain of
dismantling yards), pass `partnerAccount` to route a single call to a specific member.
The value is the reseller's `external_id` for that member — the reference set in the
business **Managed accounts** UI. A per-call value overrides any client-level default:

```typescript
await rheo.items.upsert('10-PART-001', data, { partnerAccount: '10' })
await rheo.items.updatePrice('10-PART-001', { price: 800 }, { partnerAccount: '10' })
const yard = await rheo.items.list({ status: 'active' }, { partnerAccount: '10' })
```

Set `partnerAccount` on `RheoClient` to scope *every* call to one account instead.

---

## Webhooks

Each webhook endpoint has its **own signing secret** — verify with the secret of the
endpoint that received the event. Pass it explicitly, or set one `webhookSecret` on the
client. Pass an array to accept any secret during rotation:

```typescript
const event = rheo.webhooks.verify(rawBody, signature, endpointSecret)
const rotating = rheo.webhooks.verify(rawBody, signature, [oldSecret, newSecret])
```

Events carry an additive `data.account`. On a reseller endpoint (`scope: 'members'`),
`account.memberExternalId` tells you which member the event belongs to:

```typescript
if (event.eventType === 'item.sold') {
  decrementStock(event.data.account?.memberExternalId, event.data.externalId)
}
```

Delivered event types: `item.created`, `item.images_ready`, `listing.created`,
`listing.ended`, `listing.failed`, `item.sold`.

---

## Seller-shipped orders (your carrier, your tracking)

For heavy or freight parts you ship on your own carrier account, sync the item with
`shippingStrategy: 'seller_shipped'`. When it sells you get the `orderId` on the
`item.sold` webhook; report the tracking number back and Rheo relays it to the buyer
and releases your payout against it:

```typescript
await rheo.items.upsert('ERP_ENGINE_42', {
  title: 'Komplett motor Volvo D5 — 2016',
  price: 14500,
  imageUrls: ['https://cdn.example.com/parts/42/1.jpg'],
  shippingStrategy: 'seller_shipped',
})

// later, after the item.sold webhook gives you orderId:
const shipment = await rheo.orders.submitTracking(orderId, {
  carrier: 'schenker',
  trackingNumber: 'SE123456789',
})
console.log(shipment.shipmentId)
```

`submitTracking` also accepts a per-call `{ partnerAccount }` for reseller routing.

---

## Features

- **Typed items resource** — upsert, get, delete, updatePrice, updateStatus, batchUpsert (up to 500 items), list with cursor pagination, summary, history, children
- **Seller-shipped tracking** — `orders.submitTracking` for parts you ship on your own carrier (`shippingStrategy: 'seller_shipped'`)
- **Webhook verification** — HMAC-SHA256, timing-safe, Express middleware included
- **Automatic retry** — exponential backoff on 429 / 5xx, honours `Retry-After`
- **Typed errors** — `RheoApiError`, `RheoRateLimitError`, `RheoWebhookSignatureError`
- **Vehicle hierarchy** — model donor vehicles as containers; parts reference their vehicle via `parentExternalId`, list parts with `children`
- **Reseller routing** — per-call `{ partnerAccount }` on any item method, or set it client-wide
- **Dual CJS/ESM** — works in CommonJS and ESM projects without configuration

---

## Publishing

```bash
# Bump version, tag, push — GitHub Actions publishes automatically
npm version patch   # or minor / major
git push --follow-tags
```

Requires `NPM_TOKEN` secret in GitHub repo Settings → Secrets.  
Generate at npmjs.com → Access Tokens → **Automation**.

To publish manually from your machine:

```bash
npm publish
```

Your npm session is already authenticated. If you hit a 2FA prompt, pass `--otp=<code>` with your authenticator code, or use an Automation token.

---

## Documentation

Full reference at [docs.rheo.se/sdk/typescript/](https://docs.rheo.se/sdk/typescript/)

---

## License

MIT
