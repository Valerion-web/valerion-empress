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
  let category;
  let asset;
  let employeeId;
  for (const [key, credentials] of Object.entries(users)) {
    const response = await request('/auth/login', json('POST', credentials));
    expectSuccess(response, 200, `${key} login`);
    tokens[key] = response.body.data.accessToken;
    if (key === 'employee') employeeId = response.body.data.user.id;
  }

  await check('category-crud', async () => {
    let response = await auth('hr', '/assets/categories', json('POST', { name: `Smoke Category ${runId}`, description: 'Asset smoke test' }));
    expectSuccess(response, 201, 'category create');
    category = response.body.data;
    response = await auth('hr', '/assets/categories?page=1&limit=10');
    expectSuccess(response, 200, 'category list');
    response = await auth('hr', `/assets/categories/${category.id}`, json('PUT', { description: 'Updated category' }));
    expectSuccess(response, 200, 'category update');
  });

  await check('asset-hr-authorization', async () => {
    const response = await auth('employee', '/assets', json('POST', { name: 'Forbidden', type: 'DEVICE' }));
    assert.equal(response.status, 403, 'employee should not create assets');
  });

  await check('asset-crud-search-filter', async () => {
    let response = await auth('hr', '/assets', json('POST', { name: `Smoke Laptop ${runId}`, type: 'LAPTOP', assetTag: `TAG-${runId}`, serialNumber: `SER-${runId}`, categoryId: category.id, purchasePrice: 1200, description: 'Smoke asset' }));
    expectSuccess(response, 201, 'asset create');
    asset = response.body.data;
    assert.ok(asset.id, 'asset id missing');
    response = await auth('hr', `/assets/${asset.id}`, json('PUT', { description: 'Updated smoke asset' }));
    expectSuccess(response, 200, 'asset update');
    response = await auth('hr', `/assets?q=${encodeURIComponent('Smoke Laptop')}&status=AVAILABLE&categoryId=${category.id}&page=1&limit=10`);
    expectSuccess(response, 200, 'asset search filter');
    response = await auth('hr', `/assets/${asset.id}`);
    expectSuccess(response, 200, 'asset get');
  });

  await check('asset-assignment-and-employee-view', async () => {
    let response = await auth('hr', `/assets/${asset.id}/assign`, json('POST', { userId: employeeId, notes: 'Smoke assignment' }));
    expectSuccess(response, 201, 'asset assign');
    response = await auth('employee', '/assets/my-assets?page=1&limit=10');
    expectSuccess(response, 200, 'employee asset view');
    assert.ok(response.body.data.allocations.some((item) => item.assetId === asset.id), 'assigned asset missing from employee view');
    response = await auth('hr', `/assets/${asset.id}/history?page=1&limit=20`);
    expectSuccess(response, 200, 'asset history after assignment');
    assert.ok(response.body.data.history.some((item) => item.action === 'ASSIGNED'), 'assignment history missing');
  });

  await check('asset-return-workflow', async () => {
    let response = await auth('hr', `/assets/${asset.id}/return`, json('POST', { notes: 'Smoke return' }));
    expectSuccess(response, 200, 'asset return');
    response = await auth('hr', `/assets/${asset.id}`);
    expectSuccess(response, 200, 'asset after return');
    assert.equal(response.body.data.status, 'AVAILABLE');
    response = await auth('hr', `/assets/${asset.id}/history?page=1&limit=20`);
    expectSuccess(response, 200, 'asset history after return');
    assert.ok(response.body.data.history.some((item) => item.action === 'RETURNED'), 'return history missing');
  });

  await check('asset-retire-and-category-cleanup', async () => {
    let response = await auth('hr', `/assets/${asset.id}`, { method: 'DELETE' });
    expectSuccess(response, 200, 'asset retire');
    assert.equal(response.body.data.status, 'RETIRED');
    response = await auth('hr', `/assets/categories/${category.id}`, { method: 'DELETE' });
    expectSuccess(response, 200, 'category delete');
  });

  console.log(JSON.stringify({ runId, results }, null, 2));
  if (results.some((item) => item.status === 'FAIL')) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
