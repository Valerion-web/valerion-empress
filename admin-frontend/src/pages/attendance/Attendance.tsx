import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAttendance } from '../../services/attendance'
import Spinner from '../../components/Spinner'
import Pagination from '../../components/Pagination'

export default function Attendance() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [filters, setFilters] = useState({})

  const { data, isLoading, error } = useQuery(['attendance', page, filters], () => fetchAttendance({ page, limit, ...filters }))

  if (isLoading) return <Spinner />
  if (error) return <div className="text-red-600">Error loading attendance</div>

  const items = data?.items || []
  const total = data?.total || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Attendance</h2>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Export CSV</button>
        </div>
      </div>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50"><tr><th className="p-2">User</th><th className="p-2">Date</th><th className="p-2">Status</th></tr></thead>
          <tbody>
            {items.map((r: any) => (<tr key={r.id} className="border-t"><td className="p-2">{r.user?.firstName} {r.user?.lastName}</td><td className="p-2">{new Date(r.date).toLocaleDateString()}</td><td className="p-2">{r.status}</td></tr>))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} limit={limit} onPage={setPage} />
    </div>
  )
}
