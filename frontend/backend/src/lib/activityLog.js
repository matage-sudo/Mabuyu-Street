const { supabaseAdmin } = require('../supabaseClient');

async function logActivity({ actorType, actorId = null, eventType, details = {}, ip = null }) {
  try {
    await supabaseAdmin.from('activity_log').insert({
      actor_type: actorType,
      actor_id: actorId,
      event_type: eventType,
      details,
      ip_address: ip,
    });
  } catch (err) {
    console.error('activity_log insert failed (non-fatal):', err.message);
  }
}

module.exports = { logActivity };