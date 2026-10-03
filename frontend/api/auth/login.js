// TODO: Wire to Supabase auth.signInWithPassword when ready.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(501).json({
    error: "Login not yet migrated. Use Supabase Auth from the frontend for now.",
  });
}
