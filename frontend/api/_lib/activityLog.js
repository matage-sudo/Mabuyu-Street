import { supabaseAdmin } from "./supabase.js";

export async function logActivity({ actorType, actorId, eventType, details, ip }) {
  try {
    await supabaseAdmin.from("activity_log").insert({
      actor_type: actorType || "system",
      actor_id: actorId || null,
      event_type: eventType,
      details: details || {},
      ip: ip || null,
    });
  } catch (err) {
    // Activity logging must never break the main request.
    console.error("[activityLog] failed:", err?.message || err);
  }
}
