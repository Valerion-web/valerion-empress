import fetch from 'node-fetch';

const baseUrl = process.env.BASE_URL || 'http://localhost:4000/api';
const token = process.env.TOKEN || '';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const body = await response.text();
  console.log(path, response.status, body);
  return response;
}

(async () => {
  try {
    await request('/performance-management/dashboard');
    await request('/performance-management/cycles', {
      method: 'POST',
      body: JSON.stringify({ title: 'Q4 Smoke Test', description: 'Smoke test cycle', startDate: '2026-10-01', endDate: '2026-12-31', status: 'ACTIVE' })
    });
    await request('/performance-management/goals', {
      method: 'POST',
      body: JSON.stringify({ cycleId: 'cycle-1', employeeId: 'employee-1', title: 'Smoke goal', progress: 50 })
    });
    await request('/performance-management/kpis', {
      method: 'POST',
      body: JSON.stringify({ cycleId: 'cycle-1', employeeId: 'employee-1', title: 'Smoke KPI', targetValue: 100, currentValue: 75, status: 'ACTIVE' })
    });
    await request('/performance-management/assessments', {
      method: 'POST',
      body: JSON.stringify({ cycleId: 'cycle-1', employeeId: 'employee-1', summary: 'Smoke assessment', rating: 4, status: 'SUBMITTED' })
    });
    await request('/performance-management/feedback', {
      method: 'POST',
      body: JSON.stringify({ cycleId: 'cycle-1', employeeId: 'employee-1', reviewerId: 'reviewer-1', feedback: 'Smoke feedback', rating: 4 })
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
