import assert from 'assert';

const baseUrl = 'http://localhost:4000/api';

const hrAdmin = { email: 'hradmin@valerion.local', password: 'Admin@123' };
const employee = { email: 'employee@valerion.local', password: 'Admin@123' };

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response for ${path}: ${text}`);
  }
  return { status: res.status, data };
}

async function login(user) {
  const { status, data } = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  assert.strictEqual(status, 200, `Login failed for ${user.email}: ${JSON.stringify(data)}`);
  assert.ok(data.success, `Login response unsuccessful: ${JSON.stringify(data)}`);
  assert.ok(data.data?.accessToken, 'Missing accessToken');
  return data.data.accessToken;
}

async function authRequest(token, path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return request(path, { ...options, headers });
}

async function main() {
  console.log('Logging in HR_ADMIN...');
  const hrToken = await login(hrAdmin);
  console.log('Logging in employee...');
  const empToken = await login(employee);

  console.log('Creating leave request as HR_ADMIN...');
  const createBody = {
    leaveType: 'SICK',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Medical appointment',
    remarks: 'Requires doctor note',
  };
  const createResp = await authRequest(hrToken, '/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createBody),
  });
  assert.strictEqual(createResp.status, 201, `Create leave failed: ${JSON.stringify(createResp.data)}`);
  assert.ok(createResp.data.success, `Create leave response unsuccessful: ${JSON.stringify(createResp.data)}`);
  const leave = createResp.data.data;
  assert.ok(leave?.id, 'Created leave missing id');
  const leaveId = leave.id;
  console.log(`Created leave ${leaveId}`);

  console.log('Fetching all leaves with pagination and filters...');
  const allResp = await authRequest(hrToken, '/leaves?page=1&limit=5&leaveType=SICK&status=PENDING', { method: 'GET' });
  assert.strictEqual(allResp.status, 200, `Get all leaves failed: ${JSON.stringify(allResp.data)}`);
  assert.ok(allResp.data.success, 'Get all leaves response unsuccessful');
  assert.ok(Array.isArray(allResp.data.data?.leaves), 'Leaves should be an array');

  console.log('Fetching leave by ID...');
  const byIdResp = await authRequest(hrToken, `/leaves/${leaveId}`, { method: 'GET' });
  assert.strictEqual(byIdResp.status, 200, `Get leave by ID failed: ${JSON.stringify(byIdResp.data)}`);
  assert.strictEqual(byIdResp.data.data?.id, leaveId, 'Leave ID mismatch');

  console.log('Updating leave request...');
  const updateResp = await authRequest(hrToken, `/leaves/${leaveId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Updated reason for sick leave' }),
  });
  assert.strictEqual(updateResp.status, 200, `Update leave failed: ${JSON.stringify(updateResp.data)}`);
  assert.strictEqual(updateResp.data.data?.reason, 'Updated reason for sick leave', 'Update reason not applied');

  console.log('Creating second leave for rejection test...');
  const createResp2 = await authRequest(hrToken, '/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leaveType: 'CASUAL',
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Personal time off',
      remarks: 'Two days',
    }),
  });
  assert.strictEqual(createResp2.status, 201, `Create second leave failed: ${JSON.stringify(createResp2.data)}`);
  const leaveId2 = createResp2.data.data?.id;
  assert.ok(leaveId2, 'Second leave missing id');

  console.log('Approving first leave as HR_ADMIN...');
  const approveResp = await authRequest(hrToken, `/leaves/${leaveId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks: 'Approved by HR' }),
  });
  assert.strictEqual(approveResp.status, 200, `Approve leave failed: ${JSON.stringify(approveResp.data)}`);
  assert.strictEqual(approveResp.data.data?.status, 'APPROVED', 'Leave status should be APPROVED');

  console.log('Rejecting second leave as HR_ADMIN...');
  const rejectResp = await authRequest(hrToken, `/leaves/${leaveId2}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks: 'Rejected due to policy' }),
  });
  assert.strictEqual(rejectResp.status, 200, `Reject leave failed: ${JSON.stringify(rejectResp.data)}`);
  assert.strictEqual(rejectResp.data.data?.status, 'REJECTED', 'Leave status should be REJECTED');

  console.log('Deleting rejected leave as HR_ADMIN...');
  const deleteResp = await authRequest(hrToken, `/leaves/${leaveId2}`, { method: 'DELETE' });
  assert.strictEqual(deleteResp.status, 200, `Delete leave failed: ${JSON.stringify(deleteResp.data)}`);
  assert.strictEqual(deleteResp.data.data?.id, leaveId2, 'Deleted leave ID mismatch');

  console.log('Fetching my leaves as employee...');
  const empLeavesResp = await authRequest(empToken, '/leaves/my-leaves?page=1&limit=5', { method: 'GET' });
  assert.strictEqual(empLeavesResp.status, 200, `Get my leaves failed: ${JSON.stringify(empLeavesResp.data)}`);

  console.log('Testing employee cannot approve leave...');
  const empApproveResp = await authRequest(empToken, `/leaves/${leaveId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks: 'Attempt' }),
  });
  assert.strictEqual(empApproveResp.status, 403, 'Employee should not be allowed to approve leave');

  console.log('Testing HR_ADMIN can fetch employee leaves by ID param...');
  const employeeUserResp = await authRequest(hrToken, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  assert.strictEqual(employeeUserResp.status, 200, 'Employee login failed');
  const employeeId = employeeUserResp.data.data.user.id;
  const empListResp = await authRequest(hrToken, `/leaves/employee/${employeeId}?page=1&limit=5`, { method: 'GET' });
  assert.strictEqual(empListResp.status, 200, `Get employee leaves failed: ${JSON.stringify(empListResp.data)}`);

  console.log('Testing monthly leave report..');
  const reportResp = await authRequest(hrToken, `/leaves/report/monthly?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, { method: 'GET' });
  assert.strictEqual(reportResp.status, 200, `Monthly report failed: ${JSON.stringify(reportResp.data)}`);
  assert.ok(typeof reportResp.data.data?.totalLeaves === 'number', 'Report should contain totalLeaves');

  console.log('Testing filter by leaveType and status on HR_ADMIN get all leaves...');
  const filterResp = await authRequest(hrToken, '/leaves?leaveType=SICK&status=APPROVED&page=1&limit=5', { method: 'GET' });
  assert.strictEqual(filterResp.status, 200, `Filter leaves failed: ${JSON.stringify(filterResp.data)}`);

  console.log('Smoke test passed.');
}

main().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});