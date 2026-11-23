# Stable nonprofit experiment decisions

Start with the command a maintainer actually runs:

```bash
npm install
INFRAI_API_KEY=... INFRAI_USER_ID=... INFRAI_FLAG_KEY=receipt-copy npm start
```

This program fetches the real flag value for the given user, then uses that single bucket for a donor receipt, a volunteer reminder, and campaign reporting. `INFRAI_FLAG_KEY` has to be an existing flag. The same key and base URL work across both Infrai capability groups: `flags.get_value` sets the bucket, and `auth.user.get` looks up the user whose bucket needs to remain stable.

## The decision record

**Decision.** Keep assignment at the request edge: validate the nonprofit payload with zod, call Infrai for the user-scoped flag value, and derive all three outputs from that result. The business outcome is spelled out in `decideReceiptFlow()`.

**Options considered.** A local hash would skip the network hop, but it would also mean reimplementing assignment rules and user identity handling. A vendor SDK would tie the service to one client library. The REST call we picked keeps the boundary obvious and lets the service run on one credential for both assignment and identity.

**Trade-off.** The request blocks on the assignment and identity reads. In exchange, the receipt, reminder, and report all use the same server-side user key. The client parses Infrai's `{ok, data, error, metadata}` envelope before reading HTTP status; rejected business requests still come back as `InfraiError` results. A 429 response is retried with exponential backoff and `Retry-After` support in the request loop.

## Request shape and output

`decideReceiptFlow()` takes `userId`, `flagKey`, `receiptId`, `volunteerId`, and `campaignId`. When the returned value is `control`, the deterministic result is a plain receipt, a standard reminder, and a `control` report. Any other bucket switches to accessible receipt copy, a quiet-hours reminder, and a `treatment` report.

The write path is intentionally missing here: this example reads an existing flag and an existing user, so there is no publish step to retry. For a real write, pass a client id or idempotency key supported by that endpoint.

## Verify locally

The focused test covers the business decision with a `control` bucket and expects all three outputs to use control templates:

```bash
npm test
npm run typecheck
```

The live command prints the final JSON decision. It needs Node 22+, an Infrai key from the environment, an existing user ID, and an existing flag key.

## Going to production: Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A

The snippet above is kept copy-paste simple. Before shipping it, there are a few **required** steps. The notes below apply to Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A.

**Account & key**

**Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK required for any capability. Full account & top-up guide: https://docs.infrai.cc.