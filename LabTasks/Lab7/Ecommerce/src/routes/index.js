// method, path, controller, requires authentication, success status
export const routes = [
  ['GET', '/api/health', 'health'],
  ['POST', '/api/auth/register', 'register', false, 201],
  ['POST', '/api/auth/login', 'login'],
  ['GET', '/api/auth/me', 'me', true],
  ['POST', '/api/auth/logout', 'logout', true],
  ['GET', '/api/products', 'products'],
  ['GET', '/api/products/:id', 'product'],
  ['GET', '/api/cart', 'cart', true],
  ['POST', '/api/cart/items', 'addItem', true, 201],
  ['PATCH', '/api/cart/items/:id', 'updateItem', true],
  ['DELETE', '/api/cart/items/:id', 'deleteItem', true],
  ['DELETE', '/api/cart', 'clearCart', true],
  ['POST', '/api/orders', 'placeOrder', true, 201],
  ['GET', '/api/orders', 'orders', true],
  ['GET', '/api/orders/:id', 'order', true]
];
