import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from("lectures")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  const { error } = await supabase.from("lectures").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
