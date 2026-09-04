import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { crawlers } from "@/lib/crawlers";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = request.headers.get("x-admin-password");
  const authorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    adminPassword === process.env.ADMIN_PASSWORD;

  if (!authorized) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  const results = [];

  for (const crawler of crawlers) {
    try {
      const lectures = await crawler.crawl();

      for (const lecture of lectures) {
        const { data: existing } = await supabase
          .from("lectures")
          .select("id")
          .eq("source_url", lecture.source_url)
          .limit(1);

        if (existing && existing.length > 0) continue;

        await supabase.from("lectures").insert({
          ...lecture,
          status: "pending",
        });
      }

      results.push({ crawler: crawler.name, count: lectures.length });
    } catch (e) {
      results.push({ crawler: crawler.name, error: String(e) });
    }
  }

  return Response.json({ results, timestamp: new Date().toISOString() });
}
