import { fetchWithTimeout } from "@ms/common/http";

describe("fetchWithTimeout", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    test("returns response on success", async () => {
        const mockResponse = new Response('{"ok":true}', { status: 200 });
        globalThis.fetch = jest.fn().mockResolvedValue(mockResponse);

        const res = await fetchWithTimeout("https://example.com/api", { method: "GET" }, 5000);

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('{"ok":true}');
    });

    test("aborts on timeout", async () => {
        globalThis.fetch = jest.fn().mockImplementation((_url: string, init?: RequestInit) => {
            const signal = init?.signal;
            return new Promise<Response>((_, reject) => {
                if (signal?.aborted) {
                    reject(new DOMException("aborted", "AbortError"));
                    return;
                }
                signal?.addEventListener?.("abort", () => {
                    reject(new DOMException("aborted", "AbortError"));
                });
            });
        });

        await expect(
            fetchWithTimeout("https://example.com/slow", {}, 50)
        ).rejects.toThrow(/abort/i);
    });
});
