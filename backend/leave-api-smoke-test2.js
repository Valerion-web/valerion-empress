const fetch = globalThis.fetch || require('node-fetch');
const BASE = 'http://localhost:4000/api';
async function login(email, password) { const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password }) }); return res.json(); }
async function postLeave(token) { const payload = { leaveType: 'SICK', startDate: '2026-09-01', endDate: '2026-09-02', reason: 'Automation test leave 2' }; const res = await fetch(`${BASE}/leaves`, { method: 'POST', headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); return res.json(); }
async function listLeaves(token) { const res = await fetch(`${BASE}/leaves?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); return res.json(); }
async function approveLeave(token, id) { const res = await fetch(`${BASE}/leaves/${id}/approve`, { method: 'PATCH', headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ remarks: 'Approved by smoke test' }) }); return res.json(); }
(async function run(){
  const hr = await login('hradmin@valerion.local','Admin@123'); const hrToken = hr.data?.accessToken; console.log('HR login', hr.success);
  const emp = await login('employee@valerion.local','Admin@123'); const empToken = emp.data?.accessToken; console.log('EMP login', emp.success);
  const applied = await postLeave(empToken); console.log('applied', applied.success, applied.message);
  const list = await listLeaves(hrToken); console.log('list count', list.data?.items?.length || 0);
  const first = (list.data?.items || []).find(l => l.status === 'PENDING');
  if(first){ const appr = await approveLeave(hrToken, first.id); console.log('approve', appr.success, appr.message); } else console.log('no pending');
})();
