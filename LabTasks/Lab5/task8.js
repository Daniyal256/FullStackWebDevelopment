// Task 8 — Concurrent Academic API Aggregator with async/await
const fixtures = {
  '/users': [{ id: 1, name: 'Ali', department: 'CS' }, { id: 2, name: 'Sara', department: 'CS' }, { id: 3, name: 'Hina', department: 'AI' }],
  '/courses': [{ code: 'FSWD' }, { code: 'AI101' }],
  '/results': [{ studentId: 1, marks: 82 }, { studentId: 2, marks: 45 }, { studentId: 3, marks: 95 }]
};
class HttpError extends Error { constructor(status) { super(`HTTP ${status}`); this.name = 'HttpError'; this.status = status; } }
class TimeoutError extends Error { constructor() { super('Request timed out / aborted'); this.name = 'TimeoutError'; } }
function fakeFetch(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new TimeoutError());
    const ms = url === '/slow' ? 100 : 5;
    let timer;
    function abort() { clearTimeout(timer); reject(new TimeoutError()); }
    if (signal) signal.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', abort);
      if (url === '/network') return reject(new TypeError('Network failure'));
      const status = url === '/server-error' ? 500 : (Object.hasOwn(fixtures, url) || url === '/invalid-json' || url === '/slow') ? 200 : 404;
      resolve({ ok: status >= 200 && status < 300, status,
        json: async () => {
          if (url === '/invalid-json') throw new SyntaxError('Invalid JSON');
          return structuredClone(fixtures[url] ?? { message: 'slow response' });
        }
      });
    }, ms);
  });
}
async function getJSON(url, fetchImplementation) {
  if (typeof fetchImplementation !== 'function') throw new TypeError('fetchImplementation must be a function');
  const response = await fetchImplementation(url);
  if (!response || typeof response.ok !== 'boolean' || typeof response.json !== 'function') throw new TypeError('Invalid response');
  if (!response.ok) throw new HttpError(response.status);
  return await response.json();
}
function buildDashboard(users, courses, results) {
  if (![users, courses, results].every(Array.isArray)) throw new TypeError('All API datasets must be arrays');
  const ids = new Set();
  for (const user of users) {
    if (!user || !Number.isInteger(user.id) || typeof user.name !== 'string' || typeof user.department !== 'string' || ids.has(user.id)) throw new TypeError('Invalid or duplicate user');
    ids.add(user.id);
  }
  if (!courses.every(c => c && typeof c.code === 'string' && c.code.trim())) throw new TypeError('Invalid course');
  if (!results.every(r => r && ids.has(r.studentId) && typeof r.marks === 'number' && Number.isFinite(r.marks) && r.marks >= 0 && r.marks <= 100)) throw new RangeError('Invalid marks or student ID');
  const joined = results.map(result => ({ ...result, student: users.find(user => user.id === result.studentId) }));
  const average = joined.length ? joined.reduce((sum, r) => sum + r.marks, 0) / joined.length : null;
  const best = [...joined].sort((a, b) => b.marks - a.marks || a.student.name.localeCompare(b.student.name))[0] ?? null;
  const departments = {};
  users.forEach(user => { if (!Object.hasOwn(departments, user.department)) departments[user.department] = { students: 0, examined: 0, marksTotal: 0, passed: 0, failed: 0 }; departments[user.department].students++; });
  joined.forEach(r => { const stats = departments[r.student.department]; stats.examined++; stats.marksTotal += r.marks; if (r.marks < 50) stats.failed++; else stats.passed++; });
  const departmentStats = Object.fromEntries(Object.entries(departments).map(([name, stats]) => [name, {
    students: stats.students, examined: stats.examined, average: stats.examined ? Number((stats.marksTotal / stats.examined).toFixed(2)) : null,
    passed: stats.passed, failed: stats.failed
  }]));
  return { totalStudents: users.length, totalCourses: courses.length,
    overallAverageMarks: average === null ? null : Number(average.toFixed(2)),
    highestPerformingStudent: best ? { id: best.student.id, name: best.student.name, marks: best.marks } : null,
    failedStudents: joined.filter(r => r.marks < 50).length, departmentStats };
}
async function loadDashboard(fetchImplementation = fakeFetch) {
  // Promise.all launches all three independent requests without sequential waits.
  const [users, courses, results] = await Promise.all([
    getJSON('/users', fetchImplementation), getJSON('/courses', fetchImplementation), getJSON('/results', fetchImplementation)
  ]);
  return buildDashboard(users, courses, results);
}
async function fetchWithTimeout(url, milliseconds, fetchImplementation = fakeFetch) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new RangeError('Timeout must be >= 0');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await getJSON(url, requestUrl => fetchImplementation(requestUrl, { signal: controller.signal }));
  } catch (error) {
    if (controller.signal.aborted && error.name !== 'TimeoutError') throw new TimeoutError();
    throw error;
  } finally { clearTimeout(timeoutId); }
}
async function main() {
  try {
    console.log('Dashboard:', await loadDashboard());
    console.log('Boundary (empty):', buildDashboard([], [], []));
    try { buildDashboard(fixtures['/users'], fixtures['/courses'], [{ studentId: 1, marks: 110 }]); }
    catch (error) { console.log('Invalid marks:', error.name, error.message); }
    for (const url of ['/missing', '/server-error', '/network', '/invalid-json']) {
      try { await getJSON(url, fakeFetch); }
      catch (error) { console.log(url, error.name, error.message); }
    }
    try { await fetchWithTimeout('/slow', 10); }
    catch (error) { console.log('Timeout test:', error.name, error.message); }
    console.log('Successful request before timeout:', await fetchWithTimeout('/users', 50));
  } catch (error) { console.error('Unexpected:', error); }
}
await main();
