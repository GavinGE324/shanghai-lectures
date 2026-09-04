import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "上社科学术 — 上海学术讲座聚合",
  description: "汇集上海各高校最新学术讲座信息，按学科分类，一站浏览。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
