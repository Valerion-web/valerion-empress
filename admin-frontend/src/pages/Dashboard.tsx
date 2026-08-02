import React from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Employees</div>
        <div className="p-4 bg-white rounded shadow">Attendance</div>
        <div className="p-4 bg-white rounded shadow">Payroll</div>
      </div>
    </div>
  )
}
