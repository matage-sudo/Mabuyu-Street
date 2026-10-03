import { supabaseAdmin } from "../../_lib/supabase.js";
import { requireCustomerAuth } from "../../_lib/auth.js";

export default async function handler(req, res) {
  const authed = await requireCustomerAuth(req, res);
  if (!authed) return;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ orders: data });
}