const baseUrl = process.env.API_URL ?? 'http://localhost:4000/api';
(async () => {
  const creds = { email: 'hradmin@valerion.local', password: 'Admin@123' };
  const login = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
  const js = await login.json();
  const token = js.data?.accessToken;
  console.log('token:', !!token);
  const r = await fetch(`${baseUrl}/reports/employees/export/excel`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('status', r.status, r.headers.get('content-type'));
  const text = await r.text();
  console.log('body:', text.slice(0, 2000));
})();
