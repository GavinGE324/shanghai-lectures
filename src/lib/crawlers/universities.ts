import type { Crawler, CrawledLecture } from "./base";

function guessCategory(title: string): CrawledLecture["category"] {
  const scienceKeywords = ["物理", "化学", "数学", "生物", "天文", "地质", "材料", "量子", "分子", "基因", "细胞", "光学", "力学"];
  const engineeringKeywords = ["工程", "计算机", "软件", "机械", "电子", "电气", "通信", "自动化", "芯片", "半导体", "AI", "人工智能", "机器学习", "算法", "网络", "建筑", "机器人", "数据"];
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

export const sjtuCrawler: Crawler = {
  name: "sjtu-lectures",
  university: "上海交通大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.sjtu.edu.cn/xsjz/index.html");

      const itemRegex = /<a[^>]*href="([^"]*)"[^>]*class="item"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const href = match[1];
        const block = match[2];

        const titleMatch = block.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
        const timeMatch = block.match(/<div[^>]*class="time"[^>]*>\s*<span>([\s\S]*?)<\/span>/i);
        const personMatch = block.match(/<div[^>]*class="person"[^>]*>[\s\S]*?<\/i>\s*([\s\S]*?)<\/div>/i);

        const title = titleMatch ? titleMatch[1].trim() : "";
        if (!title || title.length < 4) continue;

        const timeStr = timeMatch ? timeMatch[1].trim() : "";
        const speaker = personMatch ? personMatch[1].trim() : "详见原帖";

        let date = new Date().toISOString();
        const dateMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2})/);
        if (dateMatch) {
          date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:${dateMatch[5]}:00`;
        }

        const fullUrl = href.startsWith("http") ? href : `https://news.sjtu.edu.cn${href}`;

        results.push({
          title,
          speaker,
          date,
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

export const fudanCrawler: Crawler = {
  name: "fudan-news",
  university: "复旦大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.fudan.edu.cn/qzjx118znxhxqxlxsbg/list.htm");

      const itemRegex = /<li[^>]*class="news[^"]*"[^>]*data-title="([^"]*)"[^>]*data-url="([^"]*)"[^>]*>([\s\S]*?)<\/li>/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const title = match[1].trim();
        const dataUrl = match[2];
        const block = match[3];

        if (!title || title.length < 4) continue;

        const dateMatch = block.match(/<span[^>]*class="times"[^>]*>([\s\S]*?)<\/span>/i);
        const dateStr = dateMatch ? dateMatch[1].trim() : "";

        let date = new Date().toISOString();
        const dMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dMatch) {
          date = `${dMatch[1]}-${dMatch[2]}-${dMatch[3]}T14:00:00`;
        }

        const fullUrl = dataUrl.startsWith("http") ? dataUrl : `https://news.fudan.edu.cn${dataUrl}`;

        results.push({
          title,
          speaker: "详见原帖",
          date,
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
