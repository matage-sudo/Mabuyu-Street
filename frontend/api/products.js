import { supabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const products = data.map((p) => ({
    ...p,
    category: p.categories?.name || "Mabuyu",
  }));

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
  res.status(200).json({ products });
}
