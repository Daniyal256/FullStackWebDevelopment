export function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

export function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > 65536) fail(413, 'Request body is too large');
  }
  if (!body) return {};
  if (!req.headers['content-type']?.includes('application/json')) fail(415, 'Use Content-Type: application/json');
  try {
    const value = JSON.parse(body);
    if (!value || Array.isArray(value) || typeof value !== 'object') fail(400, 'Body must be a JSON object');
    return value;
  } catch { fail(400, 'Body must be a valid JSON object'); }
}

export function required(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(400, `${name} is required (maximum ${max} characters)`);
  return value.trim();
}

export function quantity(value) {
  if (!Number.isInteger(value) || value < 1 || value > 99) fail(400, 'Quantity must be an integer from 1 to 99');
  return value;
}
