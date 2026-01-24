export async function fetchWithTimeout(
    url: string,
    init: RequestInit = {},
    timeoutMs = 5000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }
  