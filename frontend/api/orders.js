import { supabaseAdmin } from "./_lib/supabase.js";
import { logActivity } from "./_lib/activityLog.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId, items, deliveryAddress, contactPhone, paymentMethod } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item." });
  }

  let subtotal = 0;
  const verifiedOrderItems = [];

  for (const item of items) {
    const productId = item.productId || item.product_id;
    const quantity = Number(item.quantity);

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity in order items." });
    }

    const { data: product, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
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
      quantity,
    });
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId || null,
      subtotal,
      total: subtotal,
      delivery_address: deliveryAddress || null,
      contact_phone: contactPhone || null,
      payment_method: paymentMethod || "mpesa",
    })
    .select()
    .single();

  if (orderErr) return res.status(500).json({ error: orderErr.message });

  const orderItemsWithId = verifiedOrderItems.map((i) => ({
    order_id: order.id,
    ...i,
  }));

  const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(orderItemsWithId);
  if (itemsErr) return res.status(500).json({ error: itemsErr.message });

  if (customerId) {
    await supabaseAdmin.rpc("increment_customer_orders", { customer_uuid: customerId });
  }

  await logActivity({
    actorType: customerId ? "customer" : "system",
    actorId: customerId || null,
    eventType: "order.created",
    details: { orderId: order.id, total: subtotal },
    ip: req.headers["x-forwarded-for"] || null,
  });

  res.status(201).json({ order });
}
