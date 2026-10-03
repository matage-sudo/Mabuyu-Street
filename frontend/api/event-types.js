import { supabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("event_types")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ eventTypes: data });
}
