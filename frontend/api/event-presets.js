import { supabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("event_presets")
    .select("*, products(*)")
    .eq("is_active", true);

  if (error) {
    console.error("[event-presets] Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ eventPresets: data });
}
