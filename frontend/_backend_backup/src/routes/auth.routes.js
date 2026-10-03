const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Customer Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for seamless experience
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Create corresponding entry in customer_profiles
    const { error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        phone: phone || null,
        total_orders: 0,
        loyalty_points: 0,
      });

    if (profileError) {
      console.error('Failed to create customer profile:', profileError.message);
    }

    res.status(201).json({ success: true, message: 'Account created successfully! You can now log in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during signup.' });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch customer profile details
    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name || 'Customer',
        phone: profile?.phone || '',
        loyaltyPoints: profile?.loyalty_points || 0,
      },
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

module.exports = router;