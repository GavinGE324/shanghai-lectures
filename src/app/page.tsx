"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lecture, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

export default function Home() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLectures() {
      setLoading(true);
      let query = supabase
        .from("lectures")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: false });

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      setLectures(data || []);
      setLoading(false);
    }
    fetchLectures();
  }, [activeCategory]);

  const tabs: { key: Category | "all"; label: string }[] = [
    { key: "all", label: "全部" },
    ...CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">上社科学术</h1>
          <p className="text-sm text-[var(--muted)] mt-1">上海高校学术讲座聚合</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === tab.key
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-[var(--foreground)] border border-[var(--border)] hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[var(--muted)] py-12">加载中...</p>
        ) : lectures.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-12">暂无讲座信息</p>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LectureCard({ lecture }: { lecture: Lecture }) {
  const categoryColors: Record<Category, string> = {
    science: "bg-blue-100 text-blue-700",
    engineering: "bg-green-100 text-green-700",
    social_science: "bg-purple-100 text-purple-700",
    interdisciplinary: "bg-orange-100 text-orange-700",
  };

  const dateStr = new Date(lecture.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[lecture.category]}`}>
              {CATEGORY_LABELS[lecture.category]}
            </span>
            <span className="text-xs text-[var(--muted)]">{lecture.university}</span>
          </div>
          <h3 className="font-semibold text-base mb-1 leading-snug">{lecture.title}</h3>
          <p className="text-sm text-[var(--muted)]">主讲：{lecture.speaker}</p>
          <p className="text-sm text-[var(--muted)] mt-1">{dateStr}</p>
        </div>
        <a
          href={lecture.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--primary)] hover:underline shrink-0"
        >
          原帖
        </a>
      </div>
    </div>
  );
}