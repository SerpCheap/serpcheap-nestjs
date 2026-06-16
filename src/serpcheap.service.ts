import type {
  RankParams,
  RankResponse,
  ScrapeParams,
  ScrapeResponse,
  SearchParams,
  SearchResponse,
  SerpCheap,
} from "@serpcheap/sdk";

/** Wrapper around the serp.cheap SDK client, provided by `SerpCheapModule`. */
export class SerpCheapService {
  constructor(private readonly client: SerpCheap) {}

  /** Run a Google search. */
  search(params: SearchParams): Promise<SearchResponse> {
    return this.client.search(params);
  }

  /** Fetch and extract a single page. */
  scrape(params: ScrapeParams): Promise<ScrapeResponse> {
    return this.client.scrape(params);
  }

  /** Find where a url/domain ranks for a keyword. */
  rank(params: RankParams): Promise<RankResponse> {
    return this.client.rank(params);
  }

  /** The underlying SDK client, for the full surface (`searchPages`, etc.). */
  get raw(): SerpCheap {
    return this.client;
  }
}
