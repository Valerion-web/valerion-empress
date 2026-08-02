import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMonthlyAttendance } from '../../services/attendance'
import Spinner from '../../components/Spinner'

export default function MonthlyReport() {
  const [months, setMonths] = useState(6)
  const { data, isLoading, error } = useQuery(['attendance-monthly', months], () => fetchMonthlyAttendance({ months }))

  if (isLoading) return <Spinner />
  if (error) return <div className="text-red-600">Error loading report</div>

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Monthly Attendance</h2>
      <div className="mb-4">Months: <select value={months} onChange={e => setMonths(Number(e.target.value))} className="ml-2 p-1 border rounded"><option value={3}>3</option><option value={6}>6</option><option value={12}>12</option></select></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.monthly?.map((m: any) => (
          <div key={m.month} className="p-4 bg-white rounded shadow"><div className="font-medium">{m.month}</div><div>Present: {m.present}</div><div>Absent: {m.absent}</div><div>Late: {m.late}</div></div>
        ))}
      </div>
    </div>
  )
}
