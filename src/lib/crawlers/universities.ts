import type { Crawler, CrawledLecture } from "./base";

function guessCategory(title: string): CrawledLecture["category"] {
  const scienceKeywords = ["物理", "化学", "数学", "生物", "天文", "地质", "材料", "量子", "分子", "基因", "细胞"];
  const engineeringKeywords = ["工程", "计算机", "软件", "机械", "电子", "电气", "通信", "自动化", "芯片", "半导体", "AI", "人工智能", "机器学习", "算法", "网络", "建筑"];
  const socialKeywords = ["经济", "管理", "法学", "法律", "政治", "社会", "历史", "文学", "哲学", "语言", "教育", "心理", "传播", "新闻", "艺术", "文化", "伦理", "马克思", "国际关系", "公共政策"];

  const hasScience = scienceKeywords.some((k) => title.includes(k));
  const hasEng = engineeringKeywords.some((k) => title.includes(k));
  const hasSocial = socialKeywords.some((k) => title.includes(k));

  const count = [hasScience, hasEng, hasSocial].filter(Boolean).length;
  if (count >= 2) return "interdisciplinary";
  if (hasScience) return "science";
  if (hasEng) return "engineering";
  if (hasSocial) return "social_science";
  return "social_science";
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  return res.text();
}

function extractDateFromText(text: string): string | null {
  const patterns = [
    /(\d{4})[-年/](\d{1,2})[-月/](\d{1,2})[日号]?\s*(\d{1,2}):(\d{2})/,
    /(\d{4})[-年/](\d{1,2})[-月/](\d{1,2})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const [, y, mo, d, h, mi] = m;
      return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${(h || "14").padStart(2, "0")}:${(mi || "00").padStart(2, "0")}:00`;
    }
  }
  return null;
}

export const fudanCrawler: Crawler = {
  name: "fudan-news",
  university: "复旦大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const baseUrl = "https://news.fudan.edu.cn/xsjz/";
      const html = await fetchHTML(baseUrl);

      const itemRegex = /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const block = match[0];
        const href = match[1];

        const titleMatch = block.match(/title="([^"]*)"/);
        if (!titleMatch) continue;
        const title = titleMatch[1].trim();
        if (!title || title.length < 4) continue;

        const dateMatch = extractDateFromText(block);
        const fullUrl = href.startsWith("http") ? href : `https://news.fudan.edu.cn${href}`;

        results.push({
          title,
          speaker: "详见原帖",
          date: dateMatch || new Date().toISOString(),
          university: "复旦大学",
          category: guessCategory(title),
          source_url: fullUrl,
        });
      }
    } catch (e) {
      console.error("Fudan crawler error:", e);
    }
    return results;
  },
};

export const sjtuCrawler: Crawler = {
  name: "sjtu-news",
  university: "上海交通大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const baseUrl = "https://news.sjtu.edu.cn/jdzx/index.html";
      const html = await fetchHTML(baseUrl);

      const itemRegex = /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const block = match[0];
        const href = match[1];

        const titleMatch = block.match(/title="([^"]*)"/);
        if (!titleMatch) continue;
        const title = titleMatch[1].trim();
        if (!title || title.length < 4) continue;

        const dateMatch = extractDateFromText(block);
        const fullUrl = href.startsWith("http") ? href : `https://news.sjtu.edu.cn${href}`;

        results.push({
          title,
          speaker: "详见原帖",
          date: dateMatch || new Date().toISOString(),
          university: "上海交通大学",
          category: guessCategory(title),
          source_url: fullUrl,
        });
      }
    } catch (e) {
      console.error("SJTU crawler error:", e);
    }
    return results;
  },
};
