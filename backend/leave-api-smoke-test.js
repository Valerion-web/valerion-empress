const fetch = globalThis.fetch || require('node-fetch');

const BASE = 'http://localhost:4000/api';

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password }) });
  return res.json();
}

async function postLeave(token) {
  const payload = { leaveType: 'CASUAL', startDate: '2026-08-10', endDate: '2026-08-12', reason: 'Automation test leave' };
  const res = await fetch(`${BASE}/leaves`, { method: 'POST', headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

async function listLeaves(token) {
  const res = await fetch(`${BASE}/leaves?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

async function approveLeave(token, id) {
  const res = await fetch(`${BASE}/leaves/${id}/approve`, { method: 'PATCH', headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ remarks: 'Approved by smoke test' }) });
  return res.json();
}

(async function run() {
  try {
    console.log('Logging in HR...');
    const hr = await login('hradmin@valerion.local', 'Admin@123');
    console.log('HR login:', hr.success, hr.message);
    const hrToken = hr.data?.accessToken;

    console.log('Logging in employee...');
    const emp = await login('employee@valerion.local', 'Admin@123');
    console.log('EMP login:', emp.success, emp.message);
    const empToken = emp.data?.accessToken;

    console.log('Applying leave as employee...');
    const applied = await postLeave(empToken);
    console.log('Apply result:', applied.success, applied.message);

    console.log('Listing leaves as HR...');
    const list = await listLeaves(hrToken);
    console.log('List count:', list.data?.items?.length || 0);

    const first = (list.data?.items || []).find(l => l.status === 'PENDING');
    if (first) {
      console.log('Approving leave id', first.id);
      const appr = await approveLeave(hrToken, first.id);
      console.log('Approve result:', appr.success, appr.message);
    } else {
      console.log('No pending leave found to approve');
    }
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(1);
  }
})();
