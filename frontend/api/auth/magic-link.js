export default async function handler(req, res) {
  return res.status(501).json({
    error: "Magic link not yet migrated. Use Supabase Auth from the frontend for now.",
  });
}
