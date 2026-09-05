import { createSupabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createSupabase();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "published";

  let query = supabase
    .from("lectures")
    .select("*")
    .eq("status", status)
    .order("date", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabase();
  const body = await request.json();
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("lectures")
    .insert({
      title: body.title,
      speaker: body.speaker,
      date: body.date,
      university: body.university,
      category: body.category,
      source_url: body.source_url,
      status: body.status || "published",
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
