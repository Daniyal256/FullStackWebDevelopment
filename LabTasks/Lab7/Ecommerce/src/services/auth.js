import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { fail, required } from '../utils/http.js';

const digest = token => createHash('sha256').update(token).digest('hex');
export const publicUser = ({ id, name, email, phone }) => ({ id, name, email, phone });

export function register(store, body) {
  const name = required(body.name, 'Name', 100);
  const email = required(body.email, 'Email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Invalid email address');
  const phone = required(body.phone, 'Phone', 30);
  if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) fail(400, 'Password must contain 8 to 128 characters');
  const salt = randomBytes(16).toString('hex');
  const user = { id: randomUUID(), name, email, phone, salt, passwordHash: scryptSync(body.password, salt, 64).toString('hex') };
  return store.update(data => {
    if (data.users.some(u => u.email === email || u.phone === phone)) fail(409, 'Email or phone already registered');
    data.users.push(user);
    return publicUser(user);
  });
}

export function login(store, body) {
  const identifier = required(body.identifier ?? body.email, 'Email or phone').toLowerCase();
  const password = required(body.password, 'Password', 128);
  const user = store.read().users.find(u => u.email === identifier || u.phone === identifier);
  const hash = scryptSync(password, user?.salt || 'invalid-user', 64);
  if (!user || !timingSafeEqual(hash, Buffer.from(user.passwordHash, 'hex'))) fail(401, 'Invalid credentials');
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  store.update(data => {
    data.sessions = data.sessions.filter(s => s.expiresAt > Date.now());
    data.sessions.push({ tokenHash: digest(token), userId: user.id, expiresAt });
  });
  return { token, expiresAt, user: publicUser(user) };
}

export function authenticate(store, req) {
  const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) fail(401, 'A Bearer token is required');
  const data = store.read();
  const session = data.sessions.find(s => s.tokenHash === digest(token) && s.expiresAt > Date.now());
  const user = session && data.users.find(u => u.id === session.userId);
  if (!user) fail(401, 'Session is invalid or expired');
  return { user, tokenHash: digest(token) };
}
