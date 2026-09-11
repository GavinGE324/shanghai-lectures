import type { Crawler, CrawledLecture } from "./base";

function guessCategory(title: string): CrawledLecture["category"] {
  const sci = ["物理", "化学", "数学", "生物", "天文", "地质", "材料", "量子", "分子", "基因", "细胞", "光学", "力学", "核磁", "有机", "无机", "拓扑", "苔藓"];
  const eng = ["工程", "计算机", "软件", "机械", "电子", "电气", "通信", "自动化", "芯片", "半导体", "AI", "人工智能", "机器学习", "算法", "网络", "建筑", "机器人", "数据", "vLLM", "LLM", "模型"];
  const soc = ["经济", "管理", "法学", "法律", "政治", "社会", "历史", "文学", "哲学", "语言", "教育", "心理", "传播", "新闻", "艺术", "文化", "伦理", "马克思", "国际关系", "公共政策", "诗人", "文学", "人文"];

  const hasSci = sci.some((k) => title.includes(k));
  const hasEng = eng.some((k) => title.includes(k));
  const hasSoc = soc.some((k) => title.includes(k));

  const count = [hasSci, hasEng, hasSoc].filter(Boolean).length;
  if (count >= 2) return "interdisciplinary";
  if (hasSci) return "science";
  if (hasEng) return "engineering";
  if (hasSoc) return "social_science";
  return "social_science";
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  return res.text();
}

function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d >= today;
}

export const sjtuCrawler: Crawler = {
  name: "sjtu-lectures",
  university: "上海交通大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.sjtu.edu.cn/xsjz/index.html");
      const re = /<a[^>]*href="([^"]*)"[^>]*class="item"[^>]*>([\s\S]*?)<\/a>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const href = m[1];
        const block = m[2];
        const title = block.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1]?.trim() || "";
        if (!title || title.length < 4) continue;
        const timeRaw = block.match(/<div[^>]*class="time"[^>]*>\s*<span>([\s\S]*?)<\/span>/i)?.[1]?.replace(/&nbsp;/g, " ").trim() || "";
        const speaker = block.match(/<div[^>]*class="person"[^>]*>[\s\S]*?<\/i>\s*([\s\S]*?)<\/div>/i)?.[1]?.trim() || "详见原帖";
        const dm = timeRaw.match(/(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2})/);
        const date = dm ? `${dm[1]}-${dm[2]}-${dm[3]}T${dm[4]}:${dm[5]}:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://news.sjtu.edu.cn${href}`;
        results.push({ title, speaker, date, university: "上海交通大学", category: guessCategory(title), source_url: fullUrl });
      }
    } catch (e) { console.error("SJTU crawler error:", e); }
    return results;
  },
};

export const ecnuCrawler: Crawler = {
  name: "ecnu-lectures",
  university: "华东师范大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://eoffice.ecnu.edu.cn/sublectures/zxjz/list1.htm");
      const re = /<li[^>]*class="news[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const titleRaw = block.match(/<div[^>]*class="news_title"[^>]*>([\s\S]*?)<\/div>/i)?.[1]?.trim() || "";
        if (!titleRaw || titleRaw.length < 4) continue;
        const dateStr = block.match(/<div[^>]*class="news_date"[^>]*>([\s\S]*?)<\/div>/i)?.[1]?.trim() || "";
        const href = block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const dMatch = titleRaw.match(/(\d{1,2})月(\d{1,2})日/);
        const yMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        let date = "";
        if (dMatch && yMatch) {
          date = `${yMatch[1]}-${dMatch[1].padStart(2, "0")}-${dMatch[2].padStart(2, "0")}T14:00:00`;
        } else if (yMatch) {
          date = `${yMatch[1]}-${yMatch[2]}-${yMatch[3]}T14:00:00`;
        }
        if (!date || !isFutureDate(date)) continue;
        const deptMatch = titleRaw.match(/【([^】]+)】/);
        const title = titleRaw.replace(/【[^】]+】/, "").trim();
        const fullUrl = href.startsWith("http") ? href : `https://eoffice.ecnu.edu.cn${href}`;
        results.push({
          title: deptMatch ? `[${deptMatch[1]}] ${title}` : title,
          speaker: "详见原帖", date, university: "华东师范大学",
          category: guessCategory(titleRaw), source_url: fullUrl,
        });
      }
    } catch (e) { console.error("ECNU crawler error:", e); }
    return results;
  },
};

export const tongjiCrawler: Crawler = {
  name: "tongji-lectures",
  university: "同济大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.tongji.edu.cn/jzxx1.htm");
      const re = /<li[^>]*id="line_u5[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const href = block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const titleAttr = block.match(/title="([^"]*)"/i)?.[1]?.trim() || "";
        if (!titleAttr || titleAttr.length < 4) continue;
        const dateDiv = block.match(/<div[^>]*class="tz-date[^"]*"[^>]*>\s*<span>(\d+)<\/span>\s*<i>(\d+)月<\/i>/i);
        const now = new Date();
        let date = "";
        if (dateDiv) {
          const day = dateDiv[1].padStart(2, "0");
          const month = dateDiv[2].padStart(2, "0");
          date = `${now.getFullYear()}-${month}-${day}T14:00:00`;
        }
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://news.tongji.edu.cn${href.replace("../", "")}`;
        results.push({ title: titleAttr, speaker: "详见原帖", date, university: "同济大学", category: guessCategory(titleAttr), source_url: fullUrl });
      }
    } catch (e) { console.error("Tongji crawler error:", e); }
    return results;
  },
};

export const fudanCrawler: Crawler = {
  name: "fudan-chinese",
  university: "复旦大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://chinese.fudan.edu.cn/jztg/list.htm");
      const re = /<li[^>]*class="pro_list_li"[^>]*>\s*<em>([\d\-]+)<\/em>\s*<a[^>]*href='([^']*)'[^>]*title='([^']*)'[^>]*>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const dateStr = m[1].trim();
        const href = m[2];
        const title = m[3].trim();
        if (!title || title.includes("回顾") || title.length < 4) continue;
        const dMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        const date = dMatch ? `${dMatch[1]}-${dMatch[2]}-${dMatch[3]}T14:00:00` : "";
        if (!date || !isFutureDate(date)) continue;
        results.push({ title, speaker: "详见原帖", date, university: "复旦大学", category: "social_science", source_url: href });
      }
    } catch (e) { console.error("Fudan crawler error:", e); }
    return results;
  },
};

export const shanghaitechCrawler: Crawler = {
  name: "shanghaitech-lectures",
  university: "上海科技大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const res = await fetch(
        "https://www.shanghaitech.edu.cn/_wp3services/generalQuery?queryObj=articles&siteId=8&columnId=15079&pageIndex=1&rows=20",
        { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
      );
      const json = await res.json();
      const articles = Array.isArray(json?.data) ? json.data : json?.data?.rows || [];
      for (const art of articles) {
        const title = art.title?.trim() || "";
        if (!title || title.length < 4) continue;
        const publishTime = art.publishTime || "";
        const dm = publishTime.match(/(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2})/);
        const date = dm ? `${dm[1]}-${dm[2]}-${dm[3]}T${dm[4]}:${dm[5]}:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const url = art.url?.startsWith("http") ? art.url : `https://www.shanghaitech.edu.cn${art.url || ""}`;
        results.push({ title, speaker: "详见原帖", date, university: "上海科技大学", category: guessCategory(title), source_url: url });
      }
    } catch (e) { console.error("ShanghaiTech crawler error:", e); }
    return results;
  },
};

export const ecustCrawler: Crawler = {
  name: "ecust-lectures",
  university: "华东理工大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.ecust.edu.cn/jzbg/list.htm");
      const re = /<li[^>]*class="news\s[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const titleMatch = block.match(/<a[^>]*title='([^']*)'[^>]*>/i) || block.match(/<a[^>]*title="([^"]*)"[^>]*>/i);
        const title = titleMatch?.[1]?.trim() || "";
        if (!title || title.length < 4) continue;
        const href = block.match(/<a[^>]*href='([^']*)'[^>]*>/i)?.[1] || block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const timeMatch = block.match(/<span[^>]*class="newshow"[^>]*>([\s\S]*?)<\/span>/i);
        const timeStr = timeMatch?.[1]?.trim() || "";
        const dm = timeStr.match(/(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2})/);
        const date = dm ? `${dm[1]}-${dm[2]}-${dm[3]}T${dm[4]}:${dm[5]}:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://news.ecust.edu.cn${href}`;
        results.push({ title, speaker: "详见原帖", date, university: "华东理工大学", category: guessCategory(title), source_url: fullUrl });
      }
    } catch (e) { console.error("ECUST crawler error:", e); }
    return results;
  },
};

export const shouCrawler: Crawler = {
  name: "shou-lectures",
  university: "上海海洋大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://www.shou.edu.cn/xsjz/list.htm");
      const re = /<div[^>]*class="col_news_item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const titleMatch = block.match(/<a[^>]*title='([^']*)'[^>]*>/i) || block.match(/<a[^>]*title="([^"]*)"[^>]*>/i);
        const title = titleMatch?.[1]?.trim() || "";
        if (!title || title.length < 4) continue;
        const href = block.match(/<a[^>]*href='([^']*)'[^>]*>/i)?.[1] || block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const dateMatch = block.match(/(\d{4})-(\d{2})-(\d{2})/);
        const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T14:00:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://www.shou.edu.cn${href}`;
        results.push({ title, speaker: "详见原帖", date, university: "上海海洋大学", category: guessCategory(title), source_url: fullUrl });
      }
    } catch (e) { console.error("SHOU crawler error:", e); }
    return results;
  },
};

export const shisuCrawler: Crawler = {
  name: "shisu-lectures",
  university: "上海外国语大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.shisu.edu.cn/research-/4/index.html");
      const re = /<li[^>]*class="clear in-xy"[^>]*>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const titleMatch = block.match(/<a[^>]*title="([^"]*)"[^>]*>/i);
        const title = titleMatch?.[1]?.trim() || "";
        if (!title || title.length < 4) continue;
        const href = block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const dateMatch = block.match(/(\d{4})\.(\d{2})\.(\d{2})/);
        const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T14:00:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://news.shisu.edu.cn${href}`;
        results.push({ title, speaker: "详见原帖", date, university: "上海外国语大学", category: guessCategory(title), source_url: fullUrl });
      }
    } catch (e) { console.error("SHISU crawler error:", e); }
    return results;
  },
};

export const sufeCrawler: Crawler = {
  name: "sufe-lectures",
  university: "上海财经大学",
  async crawl(): Promise<CrawledLecture[]> {
    const results: CrawledLecture[] = [];
    try {
      const html = await fetchHTML("https://news.sufe.edu.cn/xsky/list.htm");
      const re = /<li[^>]*class="news\s[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const block = m[1];
        const titleMatch = block.match(/<a[^>]*title='([^']*)'[^>]*>/i) || block.match(/<a[^>]*title="([^"]*)"[^>]*>/i);
        const title = titleMatch?.[1]?.trim() || "";
        if (!title || title.length < 4) continue;
        const href = block.match(/<a[^>]*href='([^']*)'[^>]*>/i)?.[1] || block.match(/<a[^>]*href="([^"]*)"[^>]*>/i)?.[1] || "";
        const dateMatch = block.match(/(\d{4})年(\d{2})月(\d{2})日/);
        const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T14:00:00` : "";
        if (!date || !isFutureDate(date)) continue;
        const fullUrl = href.startsWith("http") ? href : `https://news.sufe.edu.cn${href}`;
        results.push({ title, speaker: "详见原帖", date, university: "上海财经大学", category: guessCategory(title), source_url: fullUrl });
      }
    } catch (e) { console.error("SUFE crawler error:", e); }
    return results;
  },
};
