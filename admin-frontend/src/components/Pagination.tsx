import React from 'react'

export default function Pagination({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="flex items-center justify-end space-x-2 mt-3">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
      <div>Page {page} / {totalPages}</div>
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-1 bg-gray-100 rounded">Next</button>
    </div>
  )
}
