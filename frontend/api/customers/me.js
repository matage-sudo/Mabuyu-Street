import { supabaseAdmin } from "../_lib/supabase.js";
import { requireCustomerAuth } from "../_lib/auth.js";

export default async function handler(req, res) {
  const authed = await requireCustomerAuth(req, res);
  if (!authed) return;

  const userId = req.user.id;

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Profile not found." });

    return res.status(200).json({
      customer: { ...data, email: req.user.email || null },
    });
  }

  if (req.method === "PATCH") {
    const { fullName, phone } = req.body || {};

    const { data, error } = await supabaseAdmin
      .from("customer_profiles")
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({
      customer: { ...data, email: req.user.email || null },
    });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
