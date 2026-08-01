import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL ?? 'http://localhost:4000/api';
const runId = Date.now().toString(36);
const users = {
  hr: { email: 'hradmin@valerion.local', password: 'Admin@123' },
  employee: { email: 'employee@valerion.local', password: 'Admin@123' },
};
const tokens = {};
const results = [];

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const body = JSON.parse(text);
  return { status: response.status, body };
}
function json(method, body) { return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
async function auth(key, path, options = {}) { return request(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${tokens[key]}` } }); }
function expectSuccess(response, status, label) { assert.equal(response.status, status, `${label}: ${response.status} ${JSON.stringify(response.body)}`); assert.equal(response.body.success, true, `${label}: unsuccessful`); }
async function check(name, action) { try { await action(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); console.log(`FAIL ${name}: ${error.message}`); } }

async function main() {
  let notificationId;
  let employeeId;
  for (const [key, credentials] of Object.entries(users)) {
    const response = await request('/auth/login', json('POST', credentials));
    expectSuccess(response, 200, `${key} login`);
    tokens[key] = response.body.data.accessToken;
    if (key === 'employee') employeeId = response.body.data.user.id;
  }

  await check('send-to-employee', async () => {
    const response = await auth('hr', '/notifications', json('POST', { userId: employeeId, title: `Hello ${runId}`, body: 'Personal notification' }));
    expectSuccess(response, 201, 'send notification');
    // get notifications for employee
  });

  await check('broadcast', async () => {
    const response = await auth('hr', '/notifications', json('POST', { broadcast: true, title: `Broadcast ${runId}`, body: 'Broadcast message' }));
    expectSuccess(response, 201, 'broadcast notification');
  });

  await check('my-notifications', async () => {
    const response = await auth('employee', '/notifications/my-notifications?page=1&limit=10');
    expectSuccess(response, 200, 'my-notifications');
    const items = response.body.data.items || response.body.data;
    assert.ok(items.length >= 1, 'expected at least one notification');
    notificationId = items[0].id;
  });

  await check('mark-read', async () => {
    const response = await auth('employee', `/notifications/${notificationId}/read`, { method: 'PATCH' });
    expectSuccess(response, 200, 'mark read');
  });

  await check('delete-own-notification', async () => {
    const response = await auth('employee', `/notifications/${notificationId}`, { method: 'DELETE' });
    expectSuccess(response, 200, 'delete notification');
  });

  console.log(JSON.stringify({ runId, results }, null, 2));
  if (results.some((item) => item.status === 'FAIL')) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
