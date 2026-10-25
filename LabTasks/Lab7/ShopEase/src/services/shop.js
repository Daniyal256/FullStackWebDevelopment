import { randomUUID } from 'node:crypto';
import { fail, quantity, required } from '../utils/http.js';

export function cartSummary(data, userId) {
  const items = (data.carts[userId] || []).map(item => {
    const product = data.products.find(p => p.id === item.productId);
    return { productId: product.id, name: product.name, price: product.price, quantity: item.quantity, lineTotal: product.price * item.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = items.length && subtotal < 2000 ? 200 : 0;
  return { items, subtotal, shipping, total: subtotal + shipping, currency: 'PKR' };
}

export function changeCart(store, userId, productId, amount, add = false) {
  quantity(amount);
  return store.update(data => {
    const product = data.products.find(p => p.id === productId);
    if (!product) fail(404, 'Product not found');
    const cart = data.carts[userId] ||= [];
    const item = cart.find(i => i.productId === productId);
    const next = add ? (item?.quantity || 0) + amount : amount;
    quantity(next);
    if (next > product.stock) fail(409, 'Insufficient stock');
    if (item) item.quantity = next;
    else cart.push({ productId, quantity: next });
    return cartSummary(data, userId);
  });
}

export function placeOrder(store, userId, body) {
  const delivery = {};
  for (const field of ['name', 'phone', 'address', 'city']) delivery[field] = required(body.delivery?.[field], `Delivery ${field}`);
  delivery.postal = body.delivery?.postal === undefined ? '' : required(body.delivery.postal, 'Postal code', 20);
  if (body.paymentMethod !== 'COD') fail(400, 'Only COD is supported; online payments require a payment provider');
  return store.update(data => {
    const summary = cartSummary(data, userId);
    if (!summary.items.length) fail(400, 'Cart is empty');
    for (const item of summary.items) {
      const product = data.products.find(p => p.id === item.productId);
      if (item.quantity > product.stock) fail(409, `Insufficient stock for ${product.name}`);
      product.stock -= item.quantity;
    }
    const order = { id: randomUUID(), userId, ...summary, delivery, paymentMethod: 'COD', paymentStatus: 'unpaid', status: 'placed', createdAt: new Date().toISOString() };
    data.orders.push(order);
    data.carts[userId] = [];
    return order;
  });
}
