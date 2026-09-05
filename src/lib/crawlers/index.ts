import {
  sjtuCrawler, ecnuCrawler, tongjiCrawler, fudanCrawler,
  shanghaitechCrawler, ecustCrawler, shouCrawler, shuCrawler, shisuCrawler, sufeCrawler,
} from "./universities";
import type { Crawler } from "./base";

export const crawlers: Crawler[] = [
  sjtuCrawler, ecnuCrawler, tongjiCrawler, fudanCrawler,
  shanghaitechCrawler, ecustCrawler, shouCrawler, shuCrawler, shisuCrawler, sufeCrawler,
];
export type { Crawler, CrawledLecture } from "./base";
