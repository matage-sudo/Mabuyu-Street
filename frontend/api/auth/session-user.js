import { supabaseAdmin } from "../_lib/supabase.js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token." });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid token." });

  return res.status(200).json({ user: data.user });
}
