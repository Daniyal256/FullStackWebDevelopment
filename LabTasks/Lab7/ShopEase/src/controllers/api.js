import { register, login, publicUser } from '../services/auth.js';
import { cartSummary, changeCart, placeOrder } from '../services/shop.js';
import { fail, required } from '../utils/http.js';

export const controllers = {
  health: () => ({ status: 'ok' }),
  register: ({ store, body }) => register(store, body),
  login: ({ store, body }) => login(store, body),
  me: ({ auth }) => publicUser(auth.user),
  logout: ({ store, auth }) => {
    store.update(data => { data.sessions = data.sessions.filter(s => s.tokenHash !== auth.tokenHash); });
    return { message: 'Logged out' };
  },
  products: ({ store, url }) => {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const category = url.searchParams.get('category');
    return store.read().products.filter(p => p.name.toLowerCase().includes(q) && (!category || p.category === category));
  },
  product: ({ store, params }) => {
    const product = store.read().products.find(p => p.id === params.id);
    if (!product) fail(404, 'Product not found');
    return product;
  },
  cart: ({ store, auth }) => cartSummary(store.read(), auth.user.id),
  addItem: ({ store, auth, body }) => changeCart(store, auth.user.id, required(body.productId, 'Product ID'), body.quantity ?? 1, true),
  updateItem: ({ store, auth, params, body }) => {
    if (!(store.read().carts[auth.user.id] || []).some(i => i.productId === params.id)) fail(404, 'Cart item not found');
    return changeCart(store, auth.user.id, params.id, body.quantity);
  },
  deleteItem: ({ store, auth, params }) => store.update(data => {
    const items = data.carts[auth.user.id] || [];
    if (!items.some(i => i.productId === params.id)) fail(404, 'Cart item not found');
    data.carts[auth.user.id] = items.filter(i => i.productId !== params.id);
    return cartSummary(data, auth.user.id);
  }),
  clearCart: ({ store, auth }) => store.update(data => {
    data.carts[auth.user.id] = [];
    return cartSummary(data, auth.user.id);
  }),
  placeOrder: ({ store, auth, body }) => placeOrder(store, auth.user.id, body),
  orders: ({ store, auth }) => store.read().orders.filter(o => o.userId === auth.user.id),
  order: ({ store, auth, params }) => {
    const order = store.read().orders.find(o => o.id === params.id && o.userId === auth.user.id);
    if (!order) fail(404, 'Order not found');
    return order;
  }
};
