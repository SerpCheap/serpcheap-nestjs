export const searchGolden = {
  search: "best running shoes",
  page: 1,
  organic: [
    { position: 1, title: "A", link: "https://a", snippet: "s" },
    { position: 2, title: "B", link: "https://b", snippet: "s" },
  ],
  stats: { balance: 994, cost: 6, cached: false },
};

export const scrapeGolden = { url: "https://example.com", status: 200, title: "Example", content: "# Example" };

export const rankGolden = {
  url: "a",
  search: "q",
  gl: "us",
  match_type: "domain",
  pages_scanned: 1,
  found: true,
  rank: 1,
  matches: [{ rank: 1, page: 1, position_on_page: 1, link: "https://a", title: "A" }],
  organic: [],
  partial: false,
  pages_failed: [],
};

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export function installFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return handler(String(input), init);
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}
