import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.API_URL ?? 'http://localhost:4000';
const apiUrl = `${baseUrl}/api`;
const runId = Date.now().toString(36);
const users = {
  superadmin: { email: 'superadmin@valerion.local', password: 'Admin@123' },
  hr: { email: 'hradmin@valerion.local', password: 'Admin@123' },
  employee: { email: 'employee@valerion.local', password: 'Admin@123' },
};
const tokens = {};
const results = [];
const prisma = new PrismaClient();

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(`${path} returned non-JSON (${response.status}): ${text}`); }
  return { status: response.status, body };
}

async function authRequest(token, path, options = {}) {
  const headers = { ...(options.headers ?? {}), Authorization: `Bearer ${token}` };
  return request(path, { ...options, headers });
}

function jsonOptions(method, body) {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

function expectStatus(response, expected, label) {
  assert.equal(response.status, expected, `${label}: expected ${expected}, got ${response.status}: ${JSON.stringify(response.body)}`);
  assert.equal(response.body.success, true, `${label}: unsuccessful response: ${JSON.stringify(response.body)}`);
}

async function login(key) {
  const response = await request('/auth/login', jsonOptions('POST', users[key]));
  expectStatus(response, 200, `login ${key}`);
  assert.ok(response.body.data?.accessToken, `login ${key}: missing access token`);
  tokens[key] = response.body.data.accessToken;
  return response.body.data.user;
}

function firstList(body, keys) {
  for (const key of keys) if (Array.isArray(body.data?.[key])) return body.data[key];
  return [];
}

async function main() {
  const current = new Date();
  const today = current.toISOString().slice(0, 10);
  const year = current.getUTCFullYear();
  const payrollYear = year + 1;
  const leaveOffsetDays = 500 + (Date.now() % 1000);
  const month = current.getUTCMonth() + 1;
  let employeeUser;
  let department;
  let designation;
  let createdEmployee;
  let attendance;
  let payroll;
  let performance;
  let leave;
  let recruitment;

  await check('server-auth-login', async () => {
    await login('superadmin');
    await login('hr');
    employeeUser = await login('employee');
  });

  await check('auth-protected-route', async () => {
    const response = await authRequest(tokens.superadmin, '/dashboard');
    expectStatus(response, 200, 'dashboard');
  });

  await check('department-list-search-filter-create-update-delete', async () => {
    let response = await authRequest(tokens.hr, '/departments?page=1&limit=10');
    expectStatus(response, 200, 'department list');
    response = await authRequest(tokens.hr, '/departments/search?q=Engineering');
    expectStatus(response, 200, 'department search');
    response = await authRequest(tokens.hr, '/departments/filter?status=ACTIVE');
    expectStatus(response, 200, 'department filter');
    response = await authRequest(tokens.hr, '/departments', jsonOptions('POST', {
      name: `Smoke Department ${runId}`,
      code: `SM${runId.slice(-8)}`,
      description: 'Automated end-to-end smoke test',
    }));
    expectStatus(response, 201, 'department create');
    department = response.body.data;
    assert.ok(department?.id, 'department create: missing id');
    response = await authRequest(tokens.hr, `/departments/${department.id}`, jsonOptions('PUT', { description: 'Updated smoke department' }));
    expectStatus(response, 200, 'department update');
    response = await authRequest(tokens.hr, `/departments/${department.id}`, { method: 'DELETE' });
    expectStatus(response, 200, 'department delete');
    department = firstList((await authRequest(tokens.hr, '/departments?page=1&limit=100')).body, ['departments'])[0];
    assert.ok(department?.id, 'department list: no department available for employee test');
  });

  await check('employee-list-search-filter-count', async () => {
    let response = await authRequest(tokens.hr, '/employees?page=1&limit=10');
    expectStatus(response, 200, 'employee list');
    response = await authRequest(tokens.hr, '/employees/search?q=Employee');
    expectStatus(response, 200, 'employee search');
    response = await authRequest(tokens.hr, '/employees/filter?status=ACTIVE');
    expectStatus(response, 200, 'employee filter');
    response = await authRequest(tokens.hr, '/employees/count');
    expectStatus(response, 200, 'employee count');
  });

  await check('employee-create-update-get-delete', async () => {
    const departmentsResponse = await authRequest(tokens.hr, '/departments?page=1&limit=100');
    const departments = firstList(departmentsResponse.body, ['departments']);
    department = departments.find((item) => item.code === 'ENG') ?? departments[0];
    assert.ok(department?.id, 'employee test: no department');
    designation = await prisma.designation.findFirst({ orderBy: { name: 'asc' } });
    assert.ok(designation?.id, 'employee test: no designation');
    let response = await authRequest(tokens.hr, '/employees', jsonOptions('POST', {
      employeeId: `SMOKE-${runId}`,
      firstName: 'Smoke',
      lastName: 'Employee',
      email: `smoke-${runId}@valerion.local`,
      gender: 'OTHER',
      departmentId: department.id,
      designationId: designation.id,
      joiningDate: new Date().toISOString(),
      employmentType: 'FULL_TIME',
      salary: 50000,
    }));
    expectStatus(response, 201, 'employee create');
    createdEmployee = response.body.data;
    assert.ok(createdEmployee?.id, 'employee create: missing id');
    response = await authRequest(tokens.hr, `/employees/${createdEmployee.id}`, { method: 'GET' });
    expectStatus(response, 200, 'employee get');
    response = await authRequest(tokens.hr, `/employees/${createdEmployee.id}`, jsonOptions('PUT', { firstName: 'Updated Smoke' }));
    expectStatus(response, 200, 'employee update');
    response = await authRequest(tokens.hr, `/employees/${createdEmployee.id}`, { method: 'DELETE' });
    expectStatus(response, 200, 'employee delete');
  });

  await check('attendance-check-in-out-query-report', async () => {
    let response = await authRequest(tokens.employee, '/attendance/check-in', jsonOptions('POST', { location: 'Smoke test' }));
    if (response.status === 400 && response.body.message?.includes('already checked in')) {
      response = await authRequest(tokens.employee, `/attendance/employee/${employeeUser.id}?page=1&limit=10`);
      expectStatus(response, 200, 'attendance existing employee');
      attendance = firstList(response.body, ['attendances', 'attendance'])[0];
    } else {
      expectStatus(response, 201, 'attendance check-in');
      attendance = response.body.data;
      response = await authRequest(tokens.employee, `/attendance/check-out/${attendance.id}`, jsonOptions('POST', {}));
      expectStatus(response, 200, 'attendance check-out');
    }
    response = await authRequest(tokens.employee, '/attendance?page=1&limit=10');
    expectStatus(response, 200, 'attendance list');
    response = await authRequest(tokens.employee, `/attendance/date?date=${today}`);
    expectStatus(response, 200, 'attendance date');
    response = await authRequest(tokens.hr, `/attendance/report?month=${month}&year=${year}`);
    expectStatus(response, 200, 'attendance report');
  });

  await check('leave-create-read-update-approve', async () => {
    const startDate = new Date(Date.now() + leaveOffsetDays * 86400000).toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + (leaveOffsetDays + 1) * 86400000).toISOString().slice(0, 10);
    let response = await authRequest(tokens.employee, '/leaves', jsonOptions('POST', { leaveType: 'SICK', startDate, endDate, reason: 'Smoke test leave' }));
    expectStatus(response, 201, 'leave create');
    leave = response.body.data;
    response = await authRequest(tokens.employee, `/leaves/${leave.id}`);
    expectStatus(response, 200, 'leave get');
    response = await authRequest(tokens.employee, `/leaves/${leave.id}`, jsonOptions('PUT', { reason: 'Updated smoke leave' }));
    expectStatus(response, 200, 'leave update');
    response = await authRequest(tokens.hr, `/leaves/${leave.id}/approve`, jsonOptions('PATCH', { remarks: 'Smoke approval' }));
    expectStatus(response, 200, 'leave approve');
    assert.equal(response.body.data?.status, 'APPROVED');
    response = await authRequest(tokens.employee, '/leaves/my-leaves?page=1&limit=10');
    expectStatus(response, 200, 'leave my leaves');
  });

  await check('payroll-create-read-update-reports-delete', async () => {
    let response = await authRequest(tokens.hr, '/payroll', jsonOptions('POST', { userId: employeeUser.id, basicSalary: 60000, allowances: 5000, deductions: 1000, bonus: 2000, month, year: payrollYear }));
    expectStatus(response, 201, 'payroll create');
    payroll = response.body.data;
    response = await authRequest(tokens.hr, `/payroll/${payroll.id}`);
    expectStatus(response, 200, 'payroll get');
    response = await authRequest(tokens.hr, `/payroll/${payroll.id}`, jsonOptions('PUT', { bonus: 2500 }));
    expectStatus(response, 200, 'payroll update');
    response = await authRequest(tokens.hr, `/payroll/employee/${employeeUser.id}?page=1&limit=10`);
    expectStatus(response, 200, 'payroll employee');
    response = await authRequest(tokens.hr, `/payroll/monthly?month=${month}&year=${payrollYear}`);
    expectStatus(response, 200, 'payroll monthly');
    response = await authRequest(tokens.hr, `/payroll/yearly?year=${payrollYear}`);
    expectStatus(response, 200, 'payroll yearly');
    response = await authRequest(tokens.hr, `/payroll/${payroll.id}`, { method: 'DELETE' });
    expectStatus(response, 200, 'payroll delete');
  });

  await check('performance-create-read-update-delete', async () => {
    const response = await authRequest(tokens.hr, '/performance', jsonOptions('POST', {
      employeeId: employeeUser.id,
      reviewerId: employeeUser.id,
      reviewPeriod: `Smoke ${runId}`,
      reviewDate: new Date().toISOString(),
      rating: 4,
      goals: 'Smoke goals',
      achievements: 'Smoke achievements',
      strengths: 'Smoke strengths',
      improvements: 'Smoke improvements',
      comments: 'Smoke comments',
      status: 'DRAFT',
    }));
    expectStatus(response, 201, 'performance create');
    performance = response.body.data;
    let next = await authRequest(tokens.hr, `/performance/${performance.id}`);
    expectStatus(next, 200, 'performance get');
    next = await authRequest(tokens.hr, `/performance/${performance.id}`, jsonOptions('PUT', { rating: 5, status: 'SUBMITTED' }));
    expectStatus(next, 200, 'performance update');
    next = await authRequest(tokens.hr, `/performance/employee/${employeeUser.id}?page=1&limit=10`);
    expectStatus(next, 200, 'performance employee');
    next = await authRequest(tokens.hr, `/performance/reviewer/${employeeUser.id}?page=1&limit=10`);
    expectStatus(next, 200, 'performance reviewer');
    next = await authRequest(tokens.hr, `/performance/${performance.id}`, { method: 'DELETE' });
    expectStatus(next, 200, 'performance delete');
  });

  await check('recruitment-route-availability', async () => {
    let response = await authRequest(tokens.hr, '/recruitment', jsonOptions('POST', {
      title: `Smoke Recruitment ${runId}`,
      openPositions: 1,
      budget: 100000,
      status: 'OPEN',
    }));
    expectStatus(response, 201, 'recruitment create');
    recruitment = response.body.data;
    response = await authRequest(tokens.hr, '/recruitment?page=1&limit=10');
    expectStatus(response, 200, 'recruitment list');
    response = await authRequest(tokens.hr, `/recruitment/${recruitment.id}`);
    expectStatus(response, 200, 'recruitment get');
    response = await authRequest(tokens.hr, `/recruitment/${recruitment.id}`, jsonOptions('PUT', { status: 'CLOSED' }));
    expectStatus(response, 200, 'recruitment update');
    response = await authRequest(tokens.hr, `/recruitment/${recruitment.id}`, { method: 'DELETE' });
    expectStatus(response, 200, 'recruitment delete');
  });

  console.log(JSON.stringify({ runId, results }, null, 2));
  if (results.some((result) => result.status === 'FAIL')) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
