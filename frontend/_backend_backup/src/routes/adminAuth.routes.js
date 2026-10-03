const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin } = require('../supabaseClient');
const { requireAdmin } = require('../middleware/adminAuth');
const { logActivity } = require('../lib/activityLog');

const router = express.Router();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const { data: adminRow, error: adminLookupErr } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, role')
    .eq('username', username)
    .maybeSingle();

  const genericError = { error: 'Invalid username or password.' };

  if (adminLookupErr || !adminRow) {
    await logActivity({ actorType: 'system', eventType: 'admin.login_failed', details: { username }, ip: req.ip });
    return res.status(401).json(genericError);
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(adminRow.id);
  const email = authUser?.user?.email;
  if (!email) {
    return res.status(401).json(genericError);
  }

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr || !signInData?.user) {
    await logActivity({
      actorType: 'system',
      eventType: 'admin.login_failed',
      details: { username },
      ip: req.ip,
    });
    return res.status(401).json(genericError);
  }

  const token = jwt.sign({ sub: adminRow.id, role: adminRow.role }, ADMIN_JWT_SECRET, {
    expiresIn: '8h',
  });

  res.cookie('admin_session', token, cookieOptions);

  await logActivity({
    actorType: 'admin',
    actorId: adminRow.id,
    eventType: 'admin.login_success',
    ip: req.ip,
  });

  res.json({ username: adminRow.username, role: adminRow.role });
});

router.post('/logout', requireAdmin, async (req, res) => {
  res.clearCookie('admin_session', { path: '/' });
  await logActivity({ actorType: 'admin', actorId: req.admin.id, eventType: 'admin.logout', ip: req.ip });
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username, role: req.admin.role });
});

module.exports = router;