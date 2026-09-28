const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../supabaseClient');
const { logActivity } = require('../lib/activityLog');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!ADMIN_JWT_SECRET) {
  throw new Error('Missing ADMIN_JWT_SECRET in .env — generate one with `openssl rand -hex 32`.');
}

async function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_session;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, ADMIN_JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const { data: adminRow, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, role')
    .eq('id', payload.sub)
    .maybeSingle();

  if (error || !adminRow) {
    return res.status(403).json({ error: 'Admin access revoked or not found.' });
  }

  req.admin = adminRow;
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== 'superadmin') {
    logActivity({
      actorType: 'admin',
      actorId: req.admin?.id,
      eventType: 'admin.forbidden_action',
      details: { path: req.originalUrl },
      ip: req.ip,
    });
    return res.status(403).json({ error: 'Superadmin access required.' });
  }
  next();
}

module.exports = { requireAdmin, requireSuperAdmin };