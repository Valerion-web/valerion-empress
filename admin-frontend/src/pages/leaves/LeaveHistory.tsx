import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLeaves, approveLeave, rejectLeave } from '../../services/leave'
import Spinner from '../../components/Spinner'
import Pagination from '../../components/Pagination'

export default function LeaveHistory() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery(['leaves', page], () => fetchLeaves({ page, limit }))

  const approve = useMutation((id: string) => approveLeave(id), { onSuccess: () => qc.invalidateQueries(['leaves']) })
  const reject = useMutation((id: string) => rejectLeave(id), { onSuccess: () => qc.invalidateQueries(['leaves']) })

  if (isLoading) return <Spinner />

  const items = data?.items || []
  const total = data?.total || 0

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Leave History</h2>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="p-2">User</th><th className="p-2">From</th><th className="p-2">To</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map((l: any) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.user?.firstName} {l.user?.lastName}</td>
                <td className="p-2">{new Date(l.from).toLocaleDateString()}</td>
                <td className="p-2">{new Date(l.to).toLocaleDateString()}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2">
                  {l.status === 'PENDING' && (
                    <div className="space-x-2">
                      <button onClick={() => approve.mutate(l.id)} disabled={approve.isLoading} className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-60">{approve.isLoading ? 'Approving...' : 'Approve'}</button>
                      <button onClick={() => reject.mutate(l.id)} disabled={reject.isLoading} className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-60">{reject.isLoading ? 'Rejecting...' : 'Reject'}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} limit={limit} onPage={setPage} />
    </div>
  )
}
