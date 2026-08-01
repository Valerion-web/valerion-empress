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

function expectSuccess(response, status, label) { if (response.status !== status) throw new Error(`${label} status ${response.status} ${JSON.stringify(response.body)}`); if (!response.body.success) throw new Error(`${label}: unsuccessful`); }
async function check(name, action) { try { await action(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); console.log(`FAIL ${name}: ${error.message}`); } }

async function main() {
  let docId;
  let employeeId;
  for (const [key, credentials] of Object.entries(users)) {
    const res = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    expectSuccess(res, 200, `${key} login`);
    tokens[key] = res.body.data.accessToken;
    if (key === 'employee') employeeId = res.body.data.user.id;
  }

  await check('upload-by-employee', async () => {
    const form = new FormData();
    form.append('file', new Blob(['dummy']), `test-${runId}.txt`);
    form.append('documentName', `ID Card ${runId}`);
    form.append('documentType', 'ID');
    const response = await fetch(`${baseUrl}/documents`, { method: 'POST', headers: { Authorization: `Bearer ${tokens.employee}` }, body: form });
    const body = await response.json();
    if (response.status !== 201) throw new Error(`upload status ${response.status} ${JSON.stringify(body)}`);
    docId = body.data.id;
  });

  await check('upload-for-employee-by-hr', async () => {
    const form = new FormData();
    form.append('file', new Blob(['dummy2']), `test2-${runId}.txt`);
    form.append('employeeId', employeeId);
    form.append('documentName', `Contract ${runId}`);
    form.append('documentType', 'CONTRACT');
    const response = await fetch(`${baseUrl}/documents`, { method: 'POST', headers: { Authorization: `Bearer ${tokens.hr}` }, body: form });
    const body = await response.json();
    if (response.status !== 201) throw new Error(`hr upload status ${response.status} ${JSON.stringify(body)}`);
  });

  await check('get-employee-documents', async () => {
    const response = await fetch(`${baseUrl}/documents/employee/${employeeId}`, { headers: { Authorization: `Bearer ${tokens.hr}` } });
    expectSuccess({ status: response.status, body: await response.json() }, 200, 'get employee docs');
  });

  await check('get-document', async () => {
    const response = await fetch(`${baseUrl}/documents/${docId}`, { headers: { Authorization: `Bearer ${tokens.employee}` } });
    expectSuccess({ status: response.status, body: await response.json() }, 200, 'get doc');
  });

  await check('delete-document', async () => {
    const response = await fetch(`${baseUrl}/documents/${docId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokens.employee}` } });
    expectSuccess({ status: response.status, body: await response.json() }, 200, 'delete doc');
  });

  console.log(JSON.stringify({ runId, results }, null, 2));
  if (results.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
