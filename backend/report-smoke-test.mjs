const baseUrl = process.env.API_URL ?? 'http://localhost:4000/api';
const results = [];
const users = { hr: { email: 'hradmin@valerion.local', password: 'Admin@123' } };
const tokens = {};

async function request(path, opts = {}) { const res = await fetch(`${baseUrl}${path}`, opts); let body; try { body = await res.json(); } catch { body = null; } return { status: res.status, body, headers: res.headers }; }
function expectOk(r, label) { if (r.status >= 400) throw new Error(`${label} ${r.status} ${JSON.stringify(r.body)}`); }
async function check(name, fn) { try { await fn(); results.push({ name, status: 'PASS' }); console.log('PASS', name); } catch (e) { results.push({ name, status: 'FAIL', error: e.message }); console.log('FAIL', name, e.message); } }

async function main() {
  for (const [k, creds] of Object.entries(users)) { const r = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }); if (r.status !== 200) throw new Error('auth failed'); tokens[k] = r.body.data.accessToken; }

  await check('employees', async () => { const r = await request('/reports/employees', { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectOk(r, 'employees'); });
  await check('employees export csv', async () => { const r = await fetch(`${baseUrl}/reports/employees/export/csv`, { headers: { Authorization: `Bearer ${tokens.hr}` } }); if (r.status >= 400) throw new Error('export csv failed'); if (!r.headers.get('content-type').includes('text/csv')) throw new Error('wrong content-type'); });
  await check('employees export excel', async () => { const r = await fetch(`${baseUrl}/reports/employees/export/excel`, { headers: { Authorization: `Bearer ${tokens.hr}` } }); if (r.status >= 400) throw new Error('export excel failed'); if (!r.headers.get('content-type').includes('openxmlformats')) throw new Error('wrong content-type'); });
  await check('employees export pdf', async () => { const r = await fetch(`${baseUrl}/reports/employees/export/pdf`, { headers: { Authorization: `Bearer ${tokens.hr}` } }); if (r.status >= 400) throw new Error('export pdf failed'); if (!r.headers.get('content-type').includes('application/pdf')) throw new Error('wrong content-type'); });

  // basic checks for other report endpoints
  const others = ['/reports/attendance', '/reports/leaves', '/reports/payroll', '/reports/trainings', '/reports/recruitment', '/reports/assets'];
  for (const p of others) {
    await check(p, async () => { const r = await request(p, { headers: { Authorization: `Bearer ${tokens.hr}` } }); expectOk(r, p); });
  }

  console.log(JSON.stringify(results, null, 2)); if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
