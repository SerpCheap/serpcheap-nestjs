export { SerpCheapModule } from "./serpcheap.module.js";
export { SerpCheapService } from "./serpcheap.service.js";
export {
  SERPCHEAP_CLIENT,
  SERPCHEAP_OPTIONS,
  type SerpCheapModuleOptions,
  type SerpCheapModuleAsyncOptions,
} from "./constants.js";
export { VERSION } from "./version.js";

export { SerpCheap, SerpCheapError } from "@serpcheap/sdk";
export type {
  SearchParams,
  SearchResponse,
  ScrapeParams,
  ScrapeResponse,
  RankParams,
  RankResponse,
  OrganicResult,
  KnowledgeGraph,
  Country,
  Tbs,
} from "@serpcheap/sdk";
