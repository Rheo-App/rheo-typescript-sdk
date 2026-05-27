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
    domain: 'automotive_part',
    oemCode: '31400452',
    manufacturer: 'Volvo',
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
  if (event.type === 'item.sold') {
    console.log(`${event.data.externalId} sold for ${event.data.salePrice} SEK`)
  }
  res.sendStatus(200)
})
```

---

## Features

- **Typed items resource** — upsert, get, delete, updatePrice, updateStatus, batchUpsert (up to 500 items), list with cursor pagination, summary, history
- **Webhook verification** — HMAC-SHA256, timing-safe, Express middleware included
- **Automatic retry** — exponential backoff on 429 / 5xx, honours `Retry-After`
- **Typed errors** — `RheoApiError`, `RheoRateLimitError`, `RheoWebhookSignatureError`
- **Vehicle hierarchy** — model donor vehicles as containers; parts reference their vehicle via `parentExternalId`
- **Reseller routing** — pass `partnerAccount` to scope all calls to a member account
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
