import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let testResult = "not tested";
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("lectures")
      .select("id")
      .limit(1);
    testResult = error ? `error: ${error.message}` : `ok, rows: ${data?.length}`;
  } catch (e) {
    testResult = `exception: ${String(e)}`;
  }

  return Response.json({
    url_length: url.length,
    key_length: key.length,
    url_start: url.slice(0, 25),
    key_start: key.slice(0, 15),
    key_end: key.slice(-10),
    testResult,
  });
}
