"use client";

import { useEffect, useState } from "react";
import type { Lecture, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS, UNIVERSITIES } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [tab, setTab] = useState<"pending" | "published">("pending");
  const [showForm, setShowForm] = useState(false);
  const [crawling, setCrawling] = useState(false);

  const fetchLectures = async (status: string) => {
    setLectures([]);
    const res = await fetch(`/api/lectures?status=${status}`);
    const data = await res.json();
    setLectures(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (authenticated) fetchLectures(tab);
  }, [authenticated, tab]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/lectures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ status }),
    });
    fetchLectures(tab);
  };

  const deleteLecture = async (id: string) => {
    await fetch(`/api/lectures/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    fetchLectures(tab);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-[var(--border)] w-80">
          <h1 className="text-xl font-bold mb-4">管理后台</h1>
          <input
            type="password"
            placeholder="输入管理密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthenticated(true)}
            className="w-full border border-[var(--border)] rounded px-3 py-2 mb-3"
          />
          <button
            onClick={() => setAuthenticated(true)}
            className="w-full bg-[var(--primary)] text-white rounded px-4 py-2 hover:bg-[var(--primary-hover)]"
          >
            登录
          </button>
        </div>
      </div>
    );
  }
  const runCrawl = async () => {
    setCrawling(true);
    const res = await fetch("/api/crawl", {
      headers: { "x-admin-password": password },
    });
    const data = await res.json();
    setCrawling(false);
    alert(`爬虫完成：${JSON.stringify(data.results)}`);
    fetchLectures(tab);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">管理后台</h1>
            <a href="/" className="text-sm text-[var(--primary)]">← 返回首页</a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runCrawl}
              disabled={crawling}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {crawling ? "爬取中..." : "运行爬虫"}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[var(--primary)] text-white rounded px-4 py-2 text-sm hover:bg-[var(--primary-hover)]"
            >
              {showForm ? "取消" : "+ 手动添加"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {showForm && <AddForm password={password} onDone={() => { setShowForm(false); fetchLectures(tab); }} />}

        <div className="flex gap-2 mb-6">
          {(["pending", "published"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                tab === t ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)]"
              }`}
            >
              {t === "pending" ? "待审核" : "已发布"}
            </button>
          ))}
        </div>

        {lectures.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-12">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {lectures.map((l) => (
              <div key={l.id} className="bg-white rounded-lg border border-[var(--border)] p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--muted)] mb-1">{l.university} · {CATEGORY_LABELS[l.category]}</p>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-sm text-[var(--muted)]">主讲：{l.speaker} · {new Date(l.date).toLocaleDateString("zh-CN")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {tab === "pending" && (
                      <>
                        <button onClick={() => updateStatus(l.id, "published")} className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">通过</button>
                        <button onClick={() => updateStatus(l.id, "rejected")} className="text-sm px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">拒绝</button>
                      </>
                    )}
                    <button onClick={() => deleteLecture(l.id)} className="text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AddForm({ password, onDone }: { password: string; onDone: () => void }) {
  const [form, setForm] = useState({
    title: "", speaker: "", date: "", university: UNIVERSITIES[0],
    category: "social_science" as Category, source_url: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/lectures", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ ...form, status: "published" }),
    });
    onDone();
  };

  const inputClass = "w-full border border-[var(--border)] rounded px-3 py-2 text-sm";

  return (
    <form onSubmit={submit} className="bg-white border border-[var(--border)] rounded-lg p-5 mb-6 space-y-3">
      <input required placeholder="讲座主题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
      <input required placeholder="主讲人" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} className={inputClass} />
      <input required type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
      <div className="flex gap-3">
        <select value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className={inputClass}>
          {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className={inputClass}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>
      <input required placeholder="原帖链接" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} className={inputClass} />
      <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 text-sm hover:bg-[var(--primary-hover)]">添加</button>
    </form>
  );
}
