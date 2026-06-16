# @serpcheap/nestjs

[![npm](https://img.shields.io/npm/v/@serpcheap/nestjs)](https://www.npmjs.com/package/@serpcheap/nestjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

NestJS module for the [serp.cheap](https://serp.cheap) Google SERP API — an
injectable `SerpCheapService` with `forRoot` / `forRootAsync` config. Built on
[`@serpcheap/sdk`](https://www.npmjs.com/package/@serpcheap/sdk).

## Install

```bash
npm install @serpcheap/nestjs
```

## Register the module

```ts
// app.module.ts
import { Module } from "@nestjs/common";
import { SerpCheapModule } from "@serpcheap/nestjs";

@Module({
  imports: [
    SerpCheapModule.forRoot({
      apiKey: process.env.SERPCHEAP_API_KEY, // optional — defaults to this env var
      isGlobal: true,                        // optional — available app-wide
    }),
  ],
})
export class AppModule {}
```

### Async config (from `ConfigService`)

```ts
SerpCheapModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    apiKey: config.getOrThrow("SERPCHEAP_API_KEY"),
    timeoutMs: 15000,
  }),
});
```

## Use the service

```ts
import { Injectable } from "@nestjs/common";
import { SerpCheapService } from "@serpcheap/nestjs";

@Injectable()
export class SeoService {
  constructor(private readonly serp: SerpCheapService) {}

  async topResult(q: string) {
    const res = await this.serp.search({ q, gl: "us" });
    return res.organic[0];
  }
}
```

`SerpCheapService` exposes `search`, `scrape`, and `rank`. For the full SDK
surface (e.g. `searchPages`), use `serp.raw`. You can also inject the raw client
directly:

```ts
import { Inject } from "@nestjs/common";
import { SERPCHEAP_CLIENT } from "@serpcheap/nestjs";
import type { SerpCheap } from "@serpcheap/sdk";

constructor(@Inject(SERPCHEAP_CLIENT) private readonly client: SerpCheap) {}
```

## Errors

The SDK throws `SerpCheapError` (re-exported) with `.code`, `.status`, and
`.retryAfterMs`. Map them in a NestJS exception filter as you see fit. Transient
failures (`429` / `503` / timeouts) are retried with backoff automatically.

## License

MIT
