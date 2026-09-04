import { fudanCrawler, sjtuCrawler } from "./universities";
import type { Crawler } from "./base";

export const crawlers: Crawler[] = [fudanCrawler, sjtuCrawler];
export type { Crawler, CrawledLecture } from "./base";
