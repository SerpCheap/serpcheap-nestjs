import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import type { SerpCheap } from "@serpcheap/sdk";
import {
  SerpCheapModule,
  SerpCheapService,
  SERPCHEAP_CLIENT,
  SERPCHEAP_OPTIONS,
  SerpCheapError,
} from "../src/index.js";
import { searchGolden, scrapeGolden, rankGolden, jsonResponse, installFetch } from "./fixtures.js";

const KEY = "test-key";

beforeEach(() => {
  process.env.SERPCHEAP_API_KEY = KEY;
});
afterEach(() => {
  delete process.env.SERPCHEAP_API_KEY;
});

interface ProviderRecord {
  provide: unknown;
  useValue?: unknown;
  useFactory?: (...args: never[]) => unknown;
  inject?: unknown[];
}

function provider(mod: { providers?: unknown[] }, token: unknown): ProviderRecord {
  const p = (mod.providers ?? []).find((x) => typeof x === "object" && x !== null && (x as ProviderRecord).provide === token);
  return p as ProviderRecord;
}

// ---- SerpCheapService ----

test("service delegates to the injected client and exposes raw", async () => {
  const calls: string[] = [];
  const fake = {
    search: async () => { calls.push("search"); return searchGolden; },
    scrape: async () => { calls.push("scrape"); return scrapeGolden; },
    rank: async () => { calls.push("rank"); return rankGolden; },
  } as unknown as SerpCheap;
  const svc = new SerpCheapService(fake);
  await svc.search({ q: "x" });
  await svc.scrape({ url: "https://a" });
  await svc.rank({ url: "a", q: "x" });
  assert.deepEqual(calls, ["search", "scrape", "rank"]);
  assert.equal(svc.raw, fake);
});

// ---- forRoot ----

test("forRoot builds a module exporting the service + client token", () => {
  const mod = SerpCheapModule.forRoot({ apiKey: "k" });
  assert.equal(mod.module, SerpCheapModule);
  assert.equal(mod.global, false);
  assert.deepEqual(mod.exports, [SerpCheapService, SERPCHEAP_CLIENT]);
  assert.ok(provider(mod, SERPCHEAP_CLIENT).useValue);
});

test("forRoot isGlobal flag is honored", () => {
  assert.equal(SerpCheapModule.forRoot({ apiKey: "k", isGlobal: true }).global, true);
});

test("forRoot client uses the env key and works", async () => {
  const { calls, restore } = installFetch((url) => {
    assert.equal(url, "https://api.serp.cheap/v1/search");
    return jsonResponse(200, searchGolden);
  });
  try {
    const client = provider(SerpCheapModule.forRoot(), SERPCHEAP_CLIENT).useValue as SerpCheap;
    const res = await new SerpCheapService(client).search({ q: "best running shoes" });
    assert.equal(res.organic.length, 2);
    assert.equal((calls[0].init?.headers as Record<string, string>)["x-api-key"], KEY);
  } finally {
    restore();
  }
});

test("forRoot honors an explicit apiKey + base options", async () => {
  delete process.env.SERPCHEAP_API_KEY;
  const { calls, restore } = installFetch(() => jsonResponse(200, searchGolden));
  try {
    const client = provider(SerpCheapModule.forRoot({ apiKey: "explicit", baseUrl: "https://other.test" }), SERPCHEAP_CLIENT).useValue as SerpCheap;
    await client.search({ q: "x" });
    assert.equal(calls[0].url, "https://other.test/v1/search");
    assert.equal((calls[0].init?.headers as Record<string, string>)["x-api-key"], "explicit");
  } finally {
    restore();
  }
});

test("forRoot throws missing_api_key when no key is available", () => {
  delete process.env.SERPCHEAP_API_KEY;
  assert.throws(
    () => SerpCheapModule.forRoot(),
    (e: unknown) => e instanceof SerpCheapError && e.code === "missing_api_key",
  );
});

// ---- forRootAsync ----

test("forRootAsync wires an options provider feeding the client factory", async () => {
  const mod = SerpCheapModule.forRootAsync({
    imports: ["ConfigModule"],
    inject: ["ConfigService"],
    useFactory: () => ({ apiKey: "from-config" }),
  });
  assert.deepEqual(mod.imports, ["ConfigModule"]);
  const opts = provider(mod, SERPCHEAP_OPTIONS);
  assert.deepEqual(opts.inject, ["ConfigService"]);
  const resolvedOptions = await opts.useFactory!();
  assert.deepEqual(resolvedOptions, { apiKey: "from-config" });

  const clientProv = provider(mod, SERPCHEAP_CLIENT);
  assert.deepEqual(clientProv.inject, [SERPCHEAP_OPTIONS]);
  const { restore } = installFetch(() => jsonResponse(200, searchGolden));
  try {
    const client = clientProv.useFactory!(resolvedOptions as never) as SerpCheap;
    assert.equal((await client.search({ q: "x" })).organic.length, 2);
  } finally {
    restore();
  }
});

test("the service provider factory builds a SerpCheapService from the client", () => {
  const fake = { search: async () => searchGolden } as unknown as SerpCheap;
  const svcProv = provider(SerpCheapModule.forRoot({ apiKey: "k" }), SerpCheapService);
  const svc = svcProv.useFactory!(fake as never);
  assert.ok(svc instanceof SerpCheapService);
});

test("forRootAsync defaults imports/inject/global when omitted", async () => {
  const mod = SerpCheapModule.forRootAsync({ useFactory: () => ({ apiKey: "k" }) });
  assert.equal(mod.global, false);
  assert.deepEqual(mod.imports, []);
  assert.deepEqual(provider(mod, SERPCHEAP_OPTIONS).inject, []);
  assert.equal(SerpCheapModule.forRootAsync({ useFactory: () => ({ apiKey: "k" }), isGlobal: true }).global, true);
});

test("SerpCheapError is re-exported", () => {
  assert.equal(typeof SerpCheapError, "function");
});
