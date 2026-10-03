import { supabaseAdmin } from "../../_lib/supabase.js";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, created_at, customer_profiles(full_name)")
    .eq("product_id", req.query.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ reviews: data });
}