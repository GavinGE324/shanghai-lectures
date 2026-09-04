export async function GET() {
  return Response.json({
    has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20) || "MISSING",
    has_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    key_prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) || "MISSING",
  });
}
