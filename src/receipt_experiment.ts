import { z } from "zod";

export interface ReceiptExperimentClient {
  getValue(key: string, userId: string): Promise<unknown>;
  getUser(userId: string): Promise<unknown>;
}

export const receiptRequest = z.object({
  userId: z.string().min(1),
  flagKey: z.string().min(1),
  receiptId: z.string().min(1),
  volunteerId: z.string().min(1),
  campaignId: z.string().min(1),
});
export type ReceiptRequest = z.infer<typeof receiptRequest>;

export type ExperimentDecision = {
  userId: string;
  bucket: string;
  receipt: { id: string; template: string };
  reminder: { volunteerId: string; template: string };
  report: { campaignId: string; variant: string };
};

function bucketFrom(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "value" in data) return String((data as { value: unknown }).value);
  return String(data);
}

export async function decideReceiptFlow(client: ReceiptExperimentClient, input: unknown): Promise<ExperimentDecision> {
  const request = receiptRequest.parse(input);
  const [bucketValue] = await Promise.all([
    client.getValue(request.flagKey, request.userId),
    client.getUser(request.userId),
  ]);
  const bucket = bucketFrom(bucketValue);
  const variant = bucket === "control" ? "control" : "treatment";
  return {
    userId: request.userId,
    bucket,
    receipt: { id: request.receiptId, template: variant === "control" ? "plain" : "accessible" },
    reminder: { volunteerId: request.volunteerId, template: variant === "control" ? "standard" : "quiet-hours" },
    report: { campaignId: request.campaignId, variant },
  };
}
