export default async function handler(req, res) {
  // Client-side session clearing is sufficient with Supabase.
  return res.status(200).json({ ok: true });
}
