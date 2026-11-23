import { InfraiClient } from "./infrai_client.ts";
import { decideReceiptFlow } from "./receipt_experiment.ts";

const key = process.env.INFRAI_API_KEY;
const userId = process.env.INFRAI_USER_ID;
const flagKey = process.env.INFRAI_FLAG_KEY;
if (!key || !userId || !flagKey) throw new Error("Set INFRAI_API_KEY, INFRAI_USER_ID, and INFRAI_FLAG_KEY");

const result = await decideReceiptFlow(new InfraiClient(key), {
  userId,
  flagKey,
  receiptId: process.env.RECEIPT_ID ?? "receipt-demo-1",
  volunteerId: process.env.VOLUNTEER_ID ?? "volunteer-demo-1",
  campaignId: process.env.CAMPAIGN_ID ?? "campaign-demo-1",
});
console.log(JSON.stringify(result, null, 2));
