const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { requireAdmin } = require('../middleware/adminAuth');
const { logActivity } = require('../lib/activityLog');

const router = express.Router();

router.use(requireAdmin);

const RESOURCE_TABLE_MAP = {
  orders: 'orders',
  reviews: 'reviews',
  customers: 'customer_profiles',
  activity: 'activity_log',
};

router.get('/unread-counts', async (req, res) => {
  try {
    const keys = Object.keys(RESOURCE_TABLE_MAP);
    const promises = keys.map(async (key) => {
      const tableName = RESOURCE_TABLE_MAP[key];
      const { count, error } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return { key, count: count || 0 };
    });

    const results = await Promise.all(promises);
    const unreadCounts = {};
    results.forEach((item) => {
      unreadCounts[item.key] = item.count;
    });

    res.json(unreadCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-read/:resource', async (req, res) => {
  const { resource } = req.params;
  const tableName = RESOURCE_TABLE_MAP[resource];

  if (!tableName) {
    return res.status(400).json({ error: 'Invalid resource type.' });
  }

  const { error } = await supabaseAdmin
    .from(tableName)
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get('/analytics', async (req, res) => {
  const [{ count: orderCount }, { count: productCount }, { count: customerCount }, revenueRes] =
    await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('customer_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total').eq('payment_status', 'paid'),
    ]);

  const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

  res.json({
    totalRevenue,
    orderCount: orderCount || 0,
    productCount: productCount || 0,
    customerCount: customerCount || 0,
  });
});

router.get('/orders', async (req, res) => {
  const { status } = req.query;
  let query = supabaseAdmin
    .from('orders')
    .select('*, customer_profiles(full_name, phone), order_items(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ orders: data });
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body || {};
  const valid = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await logActivity({
    actorType: 'admin',
    actorId: req.admin.id,
    eventType: 'order.status_updated',
    details: { orderId: req.params.id, status },
    ip: req.ip,
  });

  res.json({ order: data });
});

router.post('/products', async (req, res) => {
  const { name, description, price, image, badge, categoryId, stock } = req.body || {};
  if (!name || price == null || !image) {
    return res.status(400).json({ error: 'name, price and image are required.' });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ name, description, price, image, badge, category_id: categoryId, stock: stock ?? 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await logActivity({
    actorType: 'admin',
    actorId: req.admin.id,
    eventType: 'product.created',
    details: { productId: data.id, name },
    ip: req.ip,
  });

  res.status(201).json({ product: data });
});

router.patch('/products/:id', async (req, res) => {
  const updates = { ...req.body, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await logActivity({
    actorType: 'admin',
    actorId: req.admin.id,
    eventType: 'product.updated',
    details: { productId: req.params.id },
    ip: req.ip,
  });

  res.json({ product: data });
});

router.delete('/products/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  await logActivity({
    actorType: 'admin',
    actorId: req.admin.id,
    eventType: 'product.deleted',
    details: { productId: req.params.id },
    ip: req.ip,
  });

  res.json({ ok: true });
});

router.get('/reviews', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*, customer_profiles(full_name), products(name)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: data });
});

router.patch('/reviews/:id', async (req, res) => {
  const { isPublished } = req.body || {};
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({ is_published: isPublished })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ review: data });
});

router.get('/customers', async (req, res) => {
  const { repeatOnly } = req.query;
  let query = supabaseAdmin.from('customer_profiles').select('*').order('total_orders', { ascending: false });
  if (repeatOnly === 'true') query = query.eq('is_repeat_customer', true);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ customers: data });
});

router.post('/customers/:id/reward', async (req, res) => {
  const { points, reason } = req.body || {};
  if (!points || !reason) return res.status(400).json({ error: 'points and reason are required.' });

  const { error: insertErr } = await supabaseAdmin.from('loyalty_rewards').insert({
    customer_id: req.params.id,
    points,
    reason,
    granted_by: req.admin.id,
  });
  if (insertErr) return res.status(500).json({ error: insertErr.message });

  const { data: customer, error: fetchErr } = await supabaseAdmin
    .from('customer_profiles')
    .select('loyalty_points')
    .eq('id', req.params.id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  const { error: updateErr } = await supabaseAdmin
    .from('customer_profiles')
    .update({ loyalty_points: (customer.loyalty_points || 0) + points })
    .eq('id', req.params.id);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  await logActivity({
    actorType: 'admin',
    actorId: req.admin.id,
    eventType: 'loyalty.reward_granted',
    details: { customerId: req.params.id, points, reason },
    ip: req.ip,
  });

  res.json({ ok: true });
});

router.get('/activity', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const { data, error } = await supabaseAdmin
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ activity: data });
});

module.exports = router;