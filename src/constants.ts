import type { ClientOptions } from "@serpcheap/sdk";

/** Injection token for the raw `SerpCheap` client. */
export const SERPCHEAP_CLIENT = Symbol("SERPCHEAP_CLIENT");

/** Injection token for the resolved module options (async config). */
export const SERPCHEAP_OPTIONS = Symbol("SERPCHEAP_OPTIONS");

export interface SerpCheapModuleOptions extends Omit<ClientOptions, "fetch"> {
  /** API key. Defaults to `process.env.SERPCHEAP_API_KEY`. */
  apiKey?: string;
  /** Register the module globally so it need not be imported per-feature. */
  isGlobal?: boolean;
}

export interface SerpCheapModuleAsyncOptions {
  /** Factory returning the module options (e.g. from `ConfigService`). */
  useFactory: (...args: never[]) => SerpCheapModuleOptions | Promise<SerpCheapModuleOptions>;
  /** Providers to inject into `useFactory`. */
  inject?: unknown[];
  /** Modules to import so `inject` can be resolved (e.g. `ConfigModule`). */
  imports?: unknown[];
  isGlobal?: boolean;
}
