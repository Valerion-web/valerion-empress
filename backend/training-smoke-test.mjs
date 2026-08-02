import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL ?? 'http://localhost:4000/api';
const runId = Date.now().toString(36);
const users = { hr: { email: 'hradmin@valerion.local', password: 'Admin@123' }, employee: { email: 'employee@valerion.local', password: 'Admin@123' } };
const tokens = {};
const results = [];

async function request(path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); const body = await response.json(); return { status: response.status, body }; }
function expectSuccess(response, status, label) { if (response.status !== status) throw new Error(`${label} status ${response.status} ${JSON.stringify(response.body)}`); if (!response.body.success) throw new Error(`${label}: unsuccessful`); }
async function check(name, action) { try { await action(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); } catch (e) { results.push({ name, status: 'FAIL', error: e.message }); console.log(`FAIL ${name}: ${e.message}`); } }

async function main() {
  let trainingId;
  let employeeId;
  for (const [k, creds] of Object.entries(users)) { const res = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }); expectSuccess(res, 200, `${k} login`); tokens[k] = res.body.data.accessToken; if (k === 'employee') employeeId = res.body.data.user.id; }

  await check('create-training', async () => { const res = await request('/trainings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.hr}` }, body: JSON.stringify({ title: `Safety ${runId}`, description: 'Safety training', trainer: 'HR Team' }) }); expectSuccess(res, 201, 'create training'); trainingId = res.body.data.id; });

  await check('assign-training', async () => { const res = await request(`/trainings/${trainingId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.hr}` }, body: JSON.stringify({ userId: employeeId }) }); expectSuccess(res, 201, 'assign training'); });

  await check('my-trainings', async () => { const res = await request('/trainings/my-trainings', { headers: { Authorization: `Bearer ${tokens.employee}` } }); expectSuccess(res, 200, 'my trainings'); });

  await check('complete-training', async () => { const res = await request(`/trainings/${trainingId}/complete`, { method: 'PATCH', headers: { Authorization: `Bearer ${tokens.employee}` } }); expectSuccess(res, 200, 'complete'); });

  await check('get-assignments', async () => { const res = await request(`/trainings/${trainingId}/assignments`, { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectSuccess(res, 200, 'assignments'); });

  console.log(JSON.stringify({ runId, results }, null, 2)); if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
