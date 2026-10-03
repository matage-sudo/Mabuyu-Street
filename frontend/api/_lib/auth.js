import { supabaseAdmin } from "./supabase.js";

/**
 * Verifies the Authorization: Bearer <token> header against Supabase.
 * On success, attaches the Supabase user to req.user and returns true.
 * On failure, writes a 401 response and returns false.
 */
export async function requireCustomerAuth(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Authorization token required." });
    return false;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return false;
  }

  req.user = data.user;
  return true;
}
