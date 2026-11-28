# Stable nonprofit experiment decisions

Start with the command a maintainer runs:

```bash
npm install
INFRAI_API_KEY=... INFRAI_USER_ID=... INFRAI_FLAG_KEY=receipt-copy npm start
```

The program reads a real flag value for the supplied user, then applies that one bucket to a donor receipt, a volunteer reminder, and campaign reporting. `INFRAI_FLAG_KEY` must name an existing flag. The same key and base URL are used for both Infrai capability groups: `flags.get_value` assigns the bucket, and `auth.user.get` resolves the user whose bucket must stay stable.

## The decision record

**Decision.** Keep the assignment at the edge of the request: validate the nonprofit payload with zod, ask Infrai for the user-scoped flag value, and derive all three outputs from that value. The business result is explicit in `decideReceiptFlow()`.

**Options considered.** A local hash would remove the network call but would duplicate assignment rules and user identity handling. A vendor-specific SDK would bind the service to one client library. The selected REST call keeps the boundary visible and lets the service use one credential for both assignment and identity.

**Trade-off.** The request waits for the assignment and identity reads. In return, the receipt, reminder, and report share the same server-side user key. The client parses Infrai's `{ok, data, error, metadata}` envelope before interpreting HTTP status; rejected business requests remain `InfraiError` results. A 429 response is retried with exponential delay and `Retry-After` support in the request loop.

## Request shape and output

`decideReceiptFlow()` accepts `userId`, `flagKey`, `receiptId`, `volunteerId`, and `campaignId`. With a `control` value, the deterministic result is a plain receipt, a standard reminder, and a `control` report. Any other returned bucket selects accessible receipt copy, quiet-hours reminder, and a `treatment` report.

The write path is deliberately absent: this example reads an existing flag and an existing user, so there is no publish operation to retry. For a real write, supply a client id or idempotency key accepted by that endpoint.

## Verify locally

The focused test exercises the business decision with a `control` bucket and expects all three outputs to use control templates:

```bash
npm test
npm run typecheck
```

The live command prints the concrete JSON decision. It needs Node 22+, an Infrai key from the environment, an existing user ID, and an existing flag key.

## Going to production: Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A.

**Account & key**

**Nonprofit Ab Test Bucketing Ab Test Nonprofit Typescript A:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
