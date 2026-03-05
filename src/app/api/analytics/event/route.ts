import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashIp } from "@/lib/hash";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: true }); // Silently accept if no Supabase
  }

  try {
    const body = await req.json();
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    await supabase.from("st_analytics_events").insert({
      event: body.event ?? "unknown",
      properties: body.properties ?? null,
      session_ip: hashIp(clientIp),
    });
  } catch {
    // Fire-and-forget — never fail
  }

  return NextResponse.json({ ok: true });
}
