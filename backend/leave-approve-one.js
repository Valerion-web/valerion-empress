const fetch = globalThis.fetch || require('node-fetch');
const BASE = 'http://localhost:4000/api';
async function login(email, password) { const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password }) }); return res.json(); }
async function listLeaves(token) { const res = await fetch(`${BASE}/leaves?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); return res.json(); }
async function approveLeave(token, id) { const res = await fetch(`${BASE}/leaves/${id}/approve`, { method: 'PATCH', headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ remarks: 'Approved in automated UI smoke test' }) }); return res.json(); }
(async ()=>{
  const hr = await login('hradmin@valerion.local','Admin@123'); const hrToken=hr.data?.accessToken; console.log('HR login', hr.success);
  const list = await listLeaves(hrToken);
  const pending = (list.data?.leaves || []).find(l=>l.status==='PENDING');
  if(!pending){ console.log('No pending leave found'); process.exit(0); }
  console.log('Approving', pending.id, pending.leaveType, pending.startDate, pending.endDate);
  const appr = await approveLeave(hrToken, pending.id);
  console.log('Approve result:', appr.success, appr.message);
})();
