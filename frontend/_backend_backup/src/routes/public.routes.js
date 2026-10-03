const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { logActivity } = require('../lib/activityLog');

const router = express.Router();

// ---------------------------------------------------------------------------
// Security Middleware: Ownership & Authentication Verification
// ---------------------------------------------------------------------------
async function requireCustomerAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required.' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }

  req.user = data.user;
  next();
}

router.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'Mabuyu Street backend is running smoothly!' });
});

router.get('/categories', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories: data });
});

router.get('/products', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const products = data.map((p) => ({ ...p, category: p.categories?.name || 'Mabuyu' }));
  res.json({ products });
});

router.get('/products/:id/reviews', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, comment, created_at, customer_profiles(full_name)')
    .eq('product_id', req.params.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: data });
});

// ============================================================================
// Public Endpoints for Phase 2 Migration
// ============================================================================

router.get('/delivery-zones', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ deliveryZones: data });
});

router.get('/reviews', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*, customer_profiles(full_name), products(name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: data });
});

router.post('/reviews', async (req, res) => {
  const { customerId, productId, guestName, rating, comment } = req.body || {};

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Valid rating between 1 and 5 is required.' });
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      customer_id: customerId || null,
      product_id: productId || null,
      guest_name: guestName || null,
      rating: Number(rating),
      comment: comment || null,
      is_published: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await logActivity({
    actorType: customerId ? 'customer' : 'system',
    actorId: customerId || null,
    eventType: 'review.created',
    details: { reviewId: data.id, rating },
    ip: req.ip,
  });

  res.status(201).json({ review: data });
});

router.get('/loyalty-tiers', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('loyalty_tiers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ loyaltyTiers: data });
});

router.get('/event-types', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('event_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ eventTypes: data });
});

router.get('/event-presets', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('event_presets')
    .select('*, products(*)')
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ eventPresets: data });
});

// ============================================================================
// Secure Orders Route (Fix #2: Server-Side Price Lookup)
// ============================================================================

router.post('/orders', async (req, res) => {
  const { customerId, items, deliveryAddress, contactPhone, paymentMethod } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item.' });
  }

  let subtotal = 0;
  const verifiedOrderItems = [];

  for (const item of items) {
    const productId = item.productId || item.product_id;
    const quantity = Number(item.quantity);

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product or quantity in order items.' });
    }

    // Lookup real price from database (never trust frontend price)
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price')
      .eq('id', productId)
      .single();

    if (prodErr || !product) {
      return res.status(400).json({ error: `Product not found or invalid: ${productId}` });
    }

    const unitPrice = Number(product.price);
    subtotal += unitPrice * quantity;

    verifiedOrderItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: quantity,
    });
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId || null,
      subtotal,
      total: subtotal,
      delivery_address: deliveryAddress || null,
      contact_phone: contactPhone || null,
      payment_method: paymentMethod || 'mpesa',
    })
    .select()
    .single();

  if (orderErr) return res.status(500).json({ error: orderErr.message });

  const orderItemsWithId = verifiedOrderItems.map((i) => ({
    order_id: order.id,
    ...i,
  }));

  const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItemsWithId);
  if (itemsErr) return res.status(500).json({ error: itemsErr.message });

  if (customerId) {
    await supabaseAdmin.rpc('increment_customer_orders', { customer_uuid: customerId });
  }

  await logActivity({
    actorType: customerId ? 'customer' : 'system',
    actorId: customerId || null,
    eventType: 'order.created',
    details: { orderId: order.id, total: subtotal },
    ip: req.ip,
  });

  res.status(201).json({ order });
});

// ============================================================================
// Protected Customer Routes (Fix #1: Ownership Verification Middleware)
// ============================================================================

router.get('/customers/me/orders', requireCustomerAuth, async (req, res) => {
  const customerId = req.user.id;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ orders: data });
});

router.get('/customers/me', requireCustomerAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Profile not found.' });

  res.json({ customer: { ...data, email: req.user.email || null } });
});

router.patch('/customers/me', requireCustomerAuth, async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('customer_profiles')
    .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ customer: { ...data, email: req.user.email || null } });
});

module.exports = router;