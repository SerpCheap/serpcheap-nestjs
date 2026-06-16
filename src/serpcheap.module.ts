import type { DynamicModule, FactoryProvider, Provider } from "@nestjs/common";
import { SerpCheap } from "@serpcheap/sdk";

import {
  SERPCHEAP_CLIENT,
  SERPCHEAP_OPTIONS,
  type SerpCheapModuleAsyncOptions,
  type SerpCheapModuleOptions,
} from "./constants.js";
import { SerpCheapService } from "./serpcheap.service.js";

function makeClient({ apiKey, isGlobal: _isGlobal, ...rest }: SerpCheapModuleOptions): SerpCheap {
  return new SerpCheap(apiKey ?? process.env.SERPCHEAP_API_KEY ?? "", rest);
}

const serviceProvider: Provider = {
  provide: SerpCheapService,
  useFactory: (client: SerpCheap) => new SerpCheapService(client),
  inject: [SERPCHEAP_CLIENT],
};

/** Dynamic NestJS module — register via `forRoot` / `forRootAsync`. */
export class SerpCheapModule {
  /** Register with static options. */
  static forRoot(options: SerpCheapModuleOptions = {}): DynamicModule {
    return {
      module: SerpCheapModule,
      global: options.isGlobal ?? false,
      providers: [{ provide: SERPCHEAP_CLIENT, useValue: makeClient(options) }, serviceProvider],
      exports: [SerpCheapService, SERPCHEAP_CLIENT],
    };
  }

  /** Register with async options (e.g. resolved from `ConfigService`). */
  static forRootAsync(options: SerpCheapModuleAsyncOptions): DynamicModule {
    return {
      module: SerpCheapModule,
      global: options.isGlobal ?? false,
      imports: (options.imports ?? []) as DynamicModule["imports"],
      providers: [
        {
          provide: SERPCHEAP_OPTIONS,
          useFactory: options.useFactory,
          inject: (options.inject ?? []) as FactoryProvider["inject"],
        },
        { provide: SERPCHEAP_CLIENT, useFactory: makeClient, inject: [SERPCHEAP_OPTIONS] },
        serviceProvider,
      ],
      exports: [SerpCheapService, SERPCHEAP_CLIENT],
    };
  }
}
