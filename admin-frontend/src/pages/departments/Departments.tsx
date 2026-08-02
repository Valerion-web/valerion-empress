import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Departments() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { api.get('/departments').then(r => setItems(r.data.data.items || [])) }, [])
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Departments</h2>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50"><tr><th className="p-2">Name</th><th className="p-2">Code</th></tr></thead>
          <tbody>
            {items.map(d => (<tr key={d.id} className="border-t"><td className="p-2">{d.name}</td><td className="p-2">{d.code}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
