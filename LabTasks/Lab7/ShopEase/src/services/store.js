import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const names = ['Wireless Headphones', 'Smart Watch Pro', 'Running Shoes Pro', 'Travel Backpack 35L', 'Polarized Sunglasses', 'Luxury Eau De Parfum', 'Urban Casual Sneakers', 'Wireless Earbuds Air'];
const prices = [8999, 13500, 4499, 6999, 2499, 3999, 5999, 3299];
const categories = ['audio', 'wearables', 'footwear', 'travel', 'accessories', 'fragrance', 'footwear', 'audio'];

// One server process owns the file. Synchronous transactions serialize mutations;
// an atomic rename prevents a partially written JSON document after a crash.
export function createStore(file = process.env.DATA_FILE || resolve('data/store.json')) {
  mkdirSync(dirname(file), { recursive: true });
  let state = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {
    users: [], sessions: [], carts: {}, orders: [],
    products: names.map((name, i) => ({ id: String(i + 1), name, price: prices[i], category: categories[i], currency: 'PKR', stock: 100 }))
  };
  function save(next) {
    writeFileSync(`${file}.tmp`, JSON.stringify(next, null, 2), { mode: 0o600 });
    renameSync(`${file}.tmp`, file);
    state = next;
  }
  if (!existsSync(file)) save(state);
  return {
    read: () => structuredClone(state),
    update(fn) {
      const next = structuredClone(state);
      const result = fn(next);
      save(next);
      return result;
    }
  };
}
