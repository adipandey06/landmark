import type { ApiError } from "@/lib/types";

export async function mockFetch<T>(
  data: T,
  options?: { minDelay?: number; maxDelay?: number; errorRate?: number }
): Promise<T> {
  const { minDelay = 200, maxDelay = 600, errorRate = 0.02 } = options ?? {};
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < errorRate) {
    const error: ApiError = {
      message: "Service temporarily unavailable",
      code: "SERVICE_UNAVAILABLE",
      status: 503,
    };
    throw error;
  }

  return structuredClone(data);
}
