export interface CrawledLecture {
  title: string;
  speaker: string;
  date: string;
  university: string;
  category: "science" | "engineering" | "social_science" | "interdisciplinary";
  source_url: string;
}

export interface Crawler {
  name: string;
  university: string;
  crawl: () => Promise<CrawledLecture[]>;
}
