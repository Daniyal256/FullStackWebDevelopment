const test = require('node:test');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module.js');

test('ShopEase serves its pages and supports the lab REST API', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();

    async function request(path, method = 'GET', body, status = 200) {
      const response = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, status, `${method} ${path}`);
      return response.json();
    }

    for (const page of ['/', '/index.html', '/login.html', '/signup.html', '/cart.html',
      '/edit-cart.html', '/checkout.html', '/review-order.html']) {
      const response = await fetch(base + page);
      assert.equal(response.status, 200, page);
      assert.match(await response.text(), /assets\/js\/app\.js/);
    }
    const script = await fetch(base + '/assets/js/app.js');
    assert.equal(script.status, 200);
    assert.match(await script.text(), /fetch\(url/);
    assert.equal((await fetch(base + '/data/store.json')).status, 404);

    assert.equal((await request('/products')).length, 8);
    assert.equal((await request('/products/1')).name, 'Wireless Headphones');
    assert.ok((await request('/categories')).includes('audio'));
    await request('/categories', 'POST', { name: 'fitness' }, 201);
    assert.ok((await request('/categories')).includes('fitness'));
    const product = await request('/products', 'POST', {
      name: 'Yoga Mat', price: 1200, category: 'fitness', stock: 10,
    }, 201);
    assert.deepEqual(await request('/products?q=yoga&category=fitness'), [product]);
    assert.deepEqual(await request('/products/' + product.id), product);

    assert.equal((await request('/cart')).items.length, 0);
    const cart = await request('/cart', 'POST', { productId: product.id }, 201);
    assert.equal(cart.total, 1400);
    assert.deepEqual(await request('/cart'), cart);
    assert.equal((await request('/cart?cartId=other')).items.length, 0);
    await request('/cart/items/' + product.id, 'PATCH', { quantity: 2 });
    assert.equal((await request('/cart')).total, 2400);
    await request('/cart/items/' + product.id, 'DELETE');
    assert.equal((await request('/cart')).items.length, 0);
    await request('/cart', 'POST', { productId: product.id, quantity: 2 }, 201);

    assert.deepEqual(await request('/orders'), []);
    const order = await request('/orders', 'POST', {
      delivery: { name: 'Ali', phone: '03001234567', address: 'House 12', city: 'Islamabad' },
      paymentMethod: 'COD',
    }, 201);
    assert.equal(order.total, 2400);
    assert.deepEqual(await request('/orders'), [order]);
    assert.deepEqual(await request('/orders?cartId=other'), []);
    assert.equal((await request('/products/' + product.id)).stock, 8);
    assert.equal((await request('/cart')).items.length, 0);
  } finally {
    await app.close();
  }
});
