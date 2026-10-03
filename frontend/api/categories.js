import { supabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ categories: data });
}
