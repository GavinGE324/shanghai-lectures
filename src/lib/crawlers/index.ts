import { sjtuCrawler, ecnuCrawler, tongjiCrawler, fudanCrawler } from "./universities";
import type { Crawler } from "./base";

export const crawlers: Crawler[] = [sjtuCrawler, ecnuCrawler, tongjiCrawler, fudanCrawler];
export type { Crawler, CrawledLecture } from "./base";
