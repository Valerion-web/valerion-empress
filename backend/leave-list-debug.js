const fetch = globalThis.fetch || require('node-fetch');
const BASE = 'http://localhost:4000/api';
async function login(email, password) { const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password }) }); return res.json(); }
async function listLeaves(token) { const res = await fetch(`${BASE}/leaves?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); return res.json(); }
(async ()=>{
  const hr = await login('hradmin@valerion.local','Admin@123'); const hrToken=hr.data?.accessToken; console.log('HR login', hr.success);
  const list = await listLeaves(hrToken);
  console.log('RAW LIST:', JSON.stringify(list, null, 2));
})();
