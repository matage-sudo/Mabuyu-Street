const express = require('express');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin } = require('../supabaseClient');
const { logActivity } = require('../lib/activityLog');

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again shortly.' },
});

router.post('/signup', authLimiter, async (req, res) => {
  const { email, password, fullName, phone } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const { data, error } = await anonClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) return res.status(400).json({ error: error.message });

  if (data.user) {
    await supabaseAdmin.from('customer_profiles').insert({
      id: data.user.id,
      full_name: fullName || null,
      phone: phone || null,
      signup_method: 'email',
    });

    await logActivity({
      actorType: 'customer',
      actorId: data.user.id,
      eventType: 'customer.signup',
      details: { method: 'email' },
      ip: req.ip,
    });
  }

  res.status(201).json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    needsEmailConfirmation: !data.session,
  });
});

router.post('/magic-link', authLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const { error } = await anonClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });

  if (error) return res.status(400).json({ error: error.message });

  await logActivity({
    actorType: 'customer',
    eventType: 'customer.magic_link_requested',
    details: { email },
    ip: req.ip,
  });

  res.json({ message: 'Check your email for a sign-in link.' });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password.' });

  res.json({
    session: data.session,
    user: { id: data.user.id, email: data.user.email },
  });
});

router.get('/session-user', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'No token provided.' });

  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session.' });

  res.json({ user: { id: data.user.id, email: data.user.email } });
});

router.post('/logout', async (req, res) => {
  res.json({ ok: true });
});

router.post('/ensure-profile', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId is required.' });

  const { data: existing } = await supabaseAdmin
    .from('customer_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from('customer_profiles').insert({ id: userId, signup_method: 'magic_link' });
    await logActivity({ actorType: 'customer', actorId: userId, eventType: 'customer.signup', details: { method: 'magic_link' } });
  }

  res.json({ ok: true });
});

module.exports = router;