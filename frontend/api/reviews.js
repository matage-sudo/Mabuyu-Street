import { supabaseAdmin } from "./_lib/supabase.js";
import { logActivity } from "./_lib/activityLog.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*, customer_profiles(full_name), products(name)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({ reviews: data });
  }

  if (req.method === "POST") {
    const { customerId, productId, guestName, rating, comment } = req.body || {};

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Valid rating between 1 and 5 is required." });
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        customer_id: customerId || null,
        product_id: productId || null,
        guest_name: guestName || null,
        rating: Number(rating),
        comment: comment || null,
        is_published: true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await logActivity({
      actorType: customerId ? "customer" : "system",
      actorId: customerId || null,
      eventType: "review.created",
      details: { reviewId: data.id, rating },
      ip: req.headers["x-forwarded-for"] || null,
    });

    return res.status(201).json({ review: data });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
