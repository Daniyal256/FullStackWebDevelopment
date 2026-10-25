import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../src/services/store.js';
import { createApp } from '../src/app.js';

 test('persistent API: authentication, cart, checkout, ownership and restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'shopease-'));
  const file = join(dir, 'store.json');
  let server;
  let base;
  async function start() {
    server = createApp(createStore(file));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  }
  async function stop() { await new Promise(resolve => server.close(resolve)); }
  async function call(path, method = 'GET', body, token) {
    const response = await fetch(`${base}/api${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, ...await response.json() };
  }
  try {
    await start();
    const user = { name: 'Ali', email: 'ali@example.com', phone: '03001234567', password: 'test-password' };
    assert.equal((await call('/auth/register', 'POST', user)).status, 201);
    assert.equal((await call('/auth/register', 'POST', user)).status, 409);
    assert.equal((await call('/auth/login', 'POST', { email: user.email, password: 'incorrect' })).status, 401);
    const { data: { token } } = await call('/auth/login', 'POST', user);
    assert.equal((await call('/cart')).status, 401);
    assert.equal((await call('/products')).data.length, 8);
    assert.equal((await call('/cart/items', 'POST', { productId: '1', quantity: -1 }, token)).status, 400);
    assert.equal((await call('/cart/items', 'POST', { productId: '1', quantity: 2 }, token)).data.total, 17998);
    await stop();
    await start();
    assert.equal((await call('/cart', 'GET', undefined, token)).data.items[0].quantity, 2);
    assert.equal((await call('/auth/me', 'GET', undefined, token)).data.email, user.email);
    const body = { delivery: { name: 'Ali', phone: '03001234567', address: 'House 12', city: 'Islamabad' }, paymentMethod: 'COD', total: 1 };
    assert.equal((await call('/orders', 'POST', { ...body, paymentMethod: 'Online' }, token)).status, 400);
    const order = await call('/orders', 'POST', body, token);
    assert.equal(order.status, 201);
    assert.equal(order.data.total, 17998);
    assert.equal((await call('/cart', 'GET', undefined, token)).data.items.length, 0);
    assert.equal((await call('/products/1')).data.stock, 98);
    assert.equal((await call('/orders', 'POST', body, token)).status, 400);
    await call('/auth/register', 'POST', { ...user, email: 'other@example.com', phone: '03007654321' });
    const other = await call('/auth/login', 'POST', { email: 'other@example.com', password: user.password });
    assert.equal((await call(`/orders/${order.data.id}`, 'GET', undefined, other.data.token)).status, 404);
    assert.equal((await call('/orders', 'GET', undefined, other.data.token)).data.length, 0);
    await stop();
    await start();
    assert.equal((await call(`/orders/${order.data.id}`, 'GET', undefined, token)).data.total, 17998);
    await call('/auth/logout', 'POST', {}, token);
    assert.equal((await call('/auth/me', 'GET', undefined, token)).status, 401);
    assert.equal((await fetch(`${base}/data/store.json`)).status, 404);
  } finally {
    if (server?.listening) await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
