export type Category = "science" | "engineering" | "social_science" | "interdisciplinary";
export type LectureStatus = "pending" | "published" | "rejected";

export interface Lecture {
  id: string;
  title: string;
  speaker: string;
  date: string;
  university: string;
  category: Category;
  source_url: string;
  status: LectureStatus;
  created_at: string;
}

export const CATEGORIES: Category[] = ["science", "engineering", "social_science", "interdisciplinary"];

export const CATEGORY_LABELS: Record<Category, string> = {
  science: "理科",
  engineering: "工科",
  social_science: "社科",
  interdisciplinary: "交叉",
};

export const UNIVERSITIES = [
  "复旦大学",
  "上海交通大学",
  "同济大学",
  "华东师范大学",
  "华东理工大学",
  "上海财经大学",
  "上海外国语大学",
  "上海大学",
  "东华大学",
  "上海中医药大学",
  "上海海洋大学",
  "上海科技大学",
  "上海理工大学",
  "上海师范大学",
  "上海对外经贸大学",
  "上海海事大学",
];
