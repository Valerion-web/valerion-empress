import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL ?? 'http://localhost:4000/api';
const users = { hr: { email: 'hradmin@valerion.local', password: 'Admin@123' } };
const tokens = {};
const results = [];

async function request(path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); let body; try { body = await response.json(); } catch { body = null; } return { status: response.status, body }; }
function expectSuccess(response, label) { if (response.status >= 400) throw new Error(`${label} ${response.status} ${JSON.stringify(response.body)}`); if (response.body && response.body.success === false) throw new Error(`${label}: unsuccessful`); }
async function check(name, action) { try { await action(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); } catch (e) { results.push({ name, status: 'FAIL', error: e.message }); console.log(`FAIL ${name}: ${e.message}`); } }

async function main() {
  for (const [k, creds] of Object.entries(users)) { const res = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }); expectSuccess(res, `${k} login`); tokens[k] = res.body.data.accessToken; }

  await check('overview', async () => { const res = await request('/dashboard/overview', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'overview'); });
  await check('employees', async () => { const res = await request('/dashboard/employees?page=1&limit=5', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'employees'); });
  await check('attendance', async () => { const res = await request('/dashboard/attendance?months=3', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'attendance'); });
  await check('payroll', async () => { const res = await request('/dashboard/payroll?months=3', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'payroll'); });
  await check('recruitment', async () => { const res = await request('/dashboard/recruitment', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'recruitment'); });
  await check('training', async () => { const res = await request('/dashboard/training', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'training'); });
  await check('assets', async () => { const res = await request('/dashboard/assets', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 'assets'); });

  console.log(JSON.stringify({ results }, null, 2)); if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
