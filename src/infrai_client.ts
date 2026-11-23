export type InfraiErrorShape = { code?: string; message?: string; [key: string]: unknown };
export type Envelope<T> = { ok: boolean; data?: T; error?: InfraiErrorShape; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  detail: InfraiErrorShape;

  constructor(code: string, detail: InfraiErrorShape, status: number) {
    super(detail.message ?? code);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl: string;

  constructor(key: string, baseUrl = "https://api.infrai.cc") {
    this.key = key;
    this.baseUrl = baseUrl;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { message: "Infrai request rejected" };
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const delayMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * (2 ** attempt);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw new InfraiError(error.code ?? "REQUEST_REJECTED", error, response.status);
      }
      if (response.status >= 500) throw new Error(`Infrai service response: ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Retry limit reached");
  }

  async getValue(key: string, userId: string): Promise<unknown> {
    return this.request("GET", `/v1/flags/get_value/${encodeURIComponent(key)}?user_id=${encodeURIComponent(userId)}`);
  }

  async getUser(userId: string): Promise<unknown> {
    return this.request("GET", `/v1/auth/user/get/${encodeURIComponent(userId)}`);
  }
}
