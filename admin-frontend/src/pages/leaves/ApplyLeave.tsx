import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applyLeave } from '../../services/leave'

export default function ApplyLeave() {
  const { register, handleSubmit } = useForm()
  const qc = useQueryClient()
  const m = useMutation((data: any) => applyLeave(data), { onSuccess: () => qc.invalidateQueries(['leaves']) })

  const onSubmit = (data: any) => m.mutate(data)

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block">Leave Type</label>
          <select {...register('leaveType')} className="border p-2 rounded w-full">
            <option value="CASUAL">CASUAL</option>
            <option value="SICK">SICK</option>
            <option value="EARNED">EARNED</option>
            <option value="MATERNITY">MATERNITY</option>
            <option value="PATERNITY">PATERNITY</option>
            <option value="UNPAID">UNPAID</option>
          </select>
        </div>
        <div>
          <label className="block">Start Date</label>
          <input type="date" {...register('startDate')} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block">End Date</label>
          <input type="date" {...register('endDate')} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block">Reason</label>
          <textarea {...register('reason')} className="border p-2 rounded w-full" />
        </div>
        <div>
          <button type="submit" disabled={m.isLoading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60">{m.isLoading ? 'Applying...' : 'Apply'}</button>
          {m.isError && <div className="text-red-600 mt-2">{(m.error as any)?.message || 'Failed to apply'}</div>}
          {m.isSuccess && <div className="text-green-600 mt-2">Leave applied successfully</div>}
        </div>
      </form>
    </div>
  )
}
