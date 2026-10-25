const page = location.pathname.split('/').pop() || 'index.html';
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let session = read('shopease.session');
const draftKey = () => `shopease.checkout.${session?.user.id}`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const money = value => `Rs. ${Number(value).toLocaleString('en-PK')}`;

function notice(message, error = false) {
  let box = document.querySelector('#api-message');
  if (!box) {
    box = document.createElement('div');
    box.id = 'api-message';
    box.setAttribute('role', 'status');
    document.querySelector('main').prepend(box);
  }
  box.className = `alert alert-${error ? 'danger' : 'success'} m-3`;
  box.textContent = message;
}
async function api(path, method = 'GET', body) {
  const response = await fetch(`/api${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && session) {
      localStorage.removeItem('shopease.session');
      session = null;
    }
    throw new Error(result.error || 'Request failed');
  }
  return result.data;
}
function bindForm(form, callback) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    try { await callback(); } catch (error) { notice(error.message, true); }
    finally { button.disabled = false; }
  });
}
function summary(cart) {
  return `<div class="d-flex justify-content-between"><span>Subtotal</span><strong>${money(cart.subtotal)}</strong></div>
  <div class="d-flex justify-content-between my-2"><span>Shipping</span><span>${money(cart.shipping)}</span></div>
  <div class="d-flex justify-content-between border-top pt-3"><strong>Total (PKR)</strong><strong>${money(cart.total)}</strong></div>`;
}
function items(cart) {
  return cart.items.map(item => `<div class="d-flex justify-content-between border-bottom py-3"><span>${escape(item.name)} × ${item.quantity}</span><strong>${money(item.lineTotal)}</strong></div>`).join('');
}
function updateBadges(cart) {
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('a[href="cart.html"]').forEach(link => {
    const badge = link.querySelector('.badge');
    if (badge) badge.textContent = count;
    if (/^(My|View) Cart \(/.test(link.textContent.trim())) link.textContent = `${link.textContent.trim().startsWith('My') ? 'My' : 'View'} Cart (${count})`;
  });
}
const originalMain = document.querySelector('main').innerHTML;
const imageIds = ['photo-1505740420928-5e560c06d30e','photo-1523275335684-37898b6baf30','photo-1542291026-7eec264c27ff','photo-1553062407-98eeb64c6a62','photo-1572635196237-14b3f281503f','photo-1592945403244-b3fbafd7f539','photo-1491553895911-0055eca6402d','photo-1590658268037-6bf12165a8df'];
function fillProduct(node, item) {
  const img = node.querySelector('img');
  if (img) { img.src = `https://images.unsplash.com/${imageIds[Number(item.productId)-1]}?w=120&q=80`; img.alt = item.name; }
  node.querySelector('.fw-semibold.small').textContent = item.name;
  const detail = node.querySelector('div.text-secondary');
  if (detail) detail.textContent = `Qty: ${item.quantity}`;
}
function fillTotals(root, cart) {
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  root.querySelectorAll('.d-flex.justify-content-between').forEach(row => {
    const spans = [...row.children].filter(child => child.tagName === 'SPAN');
    if (spans.length !== 2) return;
    const label = spans[0].textContent.trim();
    if (/Subtotal|^\d+ items$/.test(label)) {
      spans[0].textContent = `Subtotal (${count} items)`; spans[1].textContent = money(cart.subtotal);
    } else if (/^(Delivery|Delivery Fee)$/.test(label)) spans[1].textContent = cart.shipping ? money(cart.shipping) : 'Free';
    else if (/^Total/.test(label)) spans[1].textContent = money(cart.total);
  });
  updateBadges(cart);
}
function fillOrderItems(root, cart) {
  const rows = [...root.querySelectorAll('div.d-flex.align-items-center.gap-3.py-2')].filter(row => row.querySelector('img'));
  const template = rows[0];
  if (!template) return;
  for (const item of cart.items) {
    const row = template.cloneNode(true);
    fillProduct(row, item);
    row.querySelector('span.fw-semibold').textContent = money(item.lineTotal);
    template.before(row);
  }
  rows.forEach(row => row.remove());
}
async function cartPage() {
  const cart = await api('/cart');
  const main = document.querySelector('main');
  main.innerHTML = originalMain;
  const tbody = main.querySelector('tbody');
  const template = tbody.querySelector('tr').cloneNode(true);
  tbody.replaceChildren();
  const editing = page === 'edit-cart.html';
  for (const item of cart.items) {
    const row = template.cloneNode(true);
    fillProduct(row, item);
    const cells = row.querySelectorAll('td');
    cells[1].textContent = money(item.price);
    cells[3].textContent = money(item.lineTotal);
    if (editing) {
      const input = row.querySelector('input');
      input.value = item.quantity; input.max = '99'; input.dataset.productId = item.productId;
      input.setAttribute('aria-label', `Quantity for ${item.name}`);
    } else {
      row.querySelector('.qty span').textContent = item.quantity;
      row.querySelectorAll('.qty a').forEach((link, index) => link.addEventListener('click', async event => {
        event.preventDefault();
        try { await api(`/cart/items/${item.productId}`, 'PATCH', { quantity: item.quantity + (index ? 1 : -1) }); await cartPage(); }
        catch(error) { notice(error.message, true); }
      }));
    }
    row.querySelector('a.text-danger').addEventListener('click', async event => {
      event.preventDefault();
      try { await api(`/cart/items/${item.productId}`, 'DELETE'); await cartPage(); } catch(error) { notice(error.message, true); }
    });
    tbody.append(row);
  }
  if (!cart.items.length) tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-secondary">Your cart is empty. Continue shopping to add products.</td></tr>';
  const count = main.querySelector('h4 span');
  if (count) count.textContent = `(${cart.items.reduce((sum,item) => sum + item.quantity,0)} items)`;
  fillTotals(main, cart);
  if (editing) bindForm(main.querySelector('form'), async () => {
    for (const input of main.querySelectorAll('input[data-product-id]')) {
      await api(`/cart/items/${input.dataset.productId}`, 'PATCH', {quantity: Number(input.value)});
    }
    location.href = 'cart.html';
  });
}
async function checkoutPage() {
  const cart = await api('/cart');
  if (!cart.items.length) { location.href = 'cart.html'; return; }
  const main = document.querySelector('main');
  const form = main.querySelector('form');
  const draft = read(draftKey()) || { delivery: {name: session.user.name, phone: session.user.phone} };
  const fields = {name:'fn',phone:'ph',address:'ad',city:'ct',postal:'pc'};
  for (const [key,id] of Object.entries(fields)) {
    const input = document.getElementById(id);
    input.value = draft.delivery?.[key] || (key === 'city' ? 'Islamabad' : '');
  }
  const online = form.querySelector('[value="Online"]');
  online.disabled = true;
  online.closest('label').title = 'Online payments are not available yet';
  form.querySelector('[value="COD"]').checked = true;
  function persist() {
    const delivery = Object.fromEntries(Object.entries(fields).map(([key,id]) => [key,document.getElementById(id).value]));
    if (!delivery.postal.trim()) delete delivery.postal;
    save(draftKey(), {delivery,paymentMethod:'COD'});
  }
  form.addEventListener('input', persist);
  form.addEventListener('change', persist);
  bindForm(form, async () => { persist(); location.href = 'review-order.html'; });
  fillOrderItems(main, cart);
  fillTotals(main, cart);
  const header = main.querySelector('.col-lg-5 .px-4');
  if (header) header.textContent = `Your Order (${cart.items.length} items)`;
}
async function reviewPage() {
  const draft = read(draftKey());
  if (!draft) { location.href = 'checkout.html'; return; }
  const cart = await api('/cart');
  if (!cart.items.length) { location.href = 'cart.html'; return; }
  const main = document.querySelector('main');
  const values = main.querySelectorAll('.row.g-2.small .col-8');
  ['name','phone','address','city'].forEach((key,index) => values[index].textContent = draft.delivery[key]);
  values[4].textContent = '2–4 Days';
  fillOrderItems(main, cart);
  fillTotals(main, cart);
  const itemsHeading = main.querySelector('.fw-bold.border-bottom span');
  if (itemsHeading) itemsHeading.textContent = `Items to be Delivered (${cart.items.length})`;
  const label = main.querySelector('label[for="orderDone"]');
  const button = document.createElement('button');
  button.className = label.className; button.innerHTML = label.innerHTML;
  label.replaceWith(button);
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const order = await api('/orders', 'POST', draft);
      localStorage.removeItem(draftKey());
      updateBadges({items:[]});
      const modal = document.querySelector('#orderModal');
      const thanks = modal.querySelector('p');
      thanks.textContent = `Thank you, ${order.delivery.name}! Your order #${order.id} has been confirmed.`;
      const lines = modal.querySelectorAll('.d-flex.justify-content-between');
      lines[0].lastElementChild.textContent = money(order.total);
      lines[2].lastElementChild.textContent = `${order.delivery.address}, ${order.delivery.city}`;
      document.querySelector('#orderDone').checked = true;
    } catch(error) { button.disabled = false; notice(error.message, true); }
  });
}

async function init() {
  if (['login.html', 'signup.html'].includes(page)) {
    const form = document.querySelector('form');
    bindForm(form, async () => {
      const email = document.querySelector('#em').value;
      const password = document.querySelector('#pw').value;
      if (page === 'signup.html') {
        if (password !== document.querySelector('#cp').value) throw new Error('Passwords do not match');
        await api('/auth/register', 'POST', { name: document.querySelector('#fn').value, email, phone: document.querySelector('#ph').value, password });
      }
      const result = await api('/auth/login', 'POST', { identifier: email, password });
      save('shopease.session', result);
      location.href = 'index.html';
    });
    return;
  }
  const protectedPages = ['cart.html', 'edit-cart.html', 'checkout.html', 'review-order.html'];
  if (session) {
    try { session.user = await api('/auth/me'); save('shopease.session', session); }
    catch (error) { if (session) throw error; }
  }
  if (!session && protectedPages.includes(page)) { location.href = 'login.html'; return; }
  if (session) {
    document.querySelectorAll('nav a[href="login.html"]').forEach(link => {
      link.textContent = `Logout (${session.user.name})`;
      link.addEventListener('click', async event => {
        event.preventDefault();
        try { await api('/auth/logout', 'POST', {}); localStorage.removeItem('shopease.session'); location.href = 'login.html'; }
        catch (error) { notice(error.message, true); }
      });
    });
  }
  if (page === 'cart.html' || page === 'edit-cart.html') return cartPage();
  if (page === 'checkout.html') return checkoutPage();
  if (page === 'review-order.html') return reviewPage();
  const products = await api('/products');
  document.querySelectorAll('.pcard').forEach((card, index) => {
    const product = products[index];
    if (!product) return;
    card.querySelector('.fw-bold.small.text-dark').textContent = product.name;
    card.querySelector('.pt-2 .fw-bold').textContent = money(product.price);
    const oldButton = card.querySelector('.btn-p');
    const button = document.createElement('button');
    button.className = oldButton.className;
    button.textContent = product.stock ? 'Add' : 'Sold out';
    button.disabled = !product.stock;
    oldButton.replaceWith(button);
    button.addEventListener('click', async () => {
      if (!session) { location.href = 'login.html'; return; }
      button.disabled = true;
      try { const cart = await api('/cart/items', 'POST', { productId: product.id, quantity: 1 }); updateBadges(cart); notice(`${product.name} added to cart.`); }
      catch (error) { notice(error.message, true); }
      finally { button.disabled = false; }
    });
  });
  // Remove the original checkbox-driven demo cart notifications.
  document.querySelectorAll('label[for="c1"], label[for="c2"]').forEach(label => {
    if (label.textContent.includes('Add')) {
      const link = document.createElement('a'); link.href = '#popular'; link.className = label.className; link.textContent = 'Shop Products'; label.replaceWith(link);
    }
  });
  const search = document.querySelector('input[placeholder="Search gear, gadgets…"]');
  search?.addEventListener('input', () => {
    document.querySelectorAll('.pcard').forEach((card, index) => { card.parentElement.hidden = !products[index]?.name.toLowerCase().includes(search.value.toLowerCase()); });
  });
  if (session) updateBadges(await api('/cart'));
  else updateBadges({ items: [] });
}
init().catch(error => {
  if (!session && ['cart.html', 'edit-cart.html', 'checkout.html', 'review-order.html'].includes(page)) location.href = 'login.html';
  else notice(`${error.message}. Please try again.`, true);
});
