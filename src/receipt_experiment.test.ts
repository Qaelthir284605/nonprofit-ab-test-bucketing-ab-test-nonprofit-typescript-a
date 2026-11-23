import test from "node:test";
import assert from "node:assert/strict";
import { decideReceiptFlow } from "./receipt_experiment.ts";

test("one stable bucket drives receipt, reminder, and campaign report", async () => {
  const calls: string[] = [];
  const client = {
    getValue: async (key: string, userId: string) => { calls.push(`${key}:${userId}`); return "control"; },
    getUser: async (userId: string) => { calls.push(`user:${userId}`); return { id: userId }; },
  };
  const result = await decideReceiptFlow(client, {
    userId: "donor-17", flagKey: "receipt-copy", receiptId: "r-1", volunteerId: "v-2", campaignId: "c-3",
  });
  assert.deepEqual(result, {
    userId: "donor-17", bucket: "control",
    receipt: { id: "r-1", template: "plain" },
    reminder: { volunteerId: "v-2", template: "standard" },
    report: { campaignId: "c-3", variant: "control" },
  });
  assert.deepEqual(calls.sort(), ["receipt-copy:donor-17", "user:donor-17"]);
});
