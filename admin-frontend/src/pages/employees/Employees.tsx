import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { Link } from 'react-router-dom'

export default function Employees() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { api.get('/employees').then(r => setItems(r.data.data.items || [])) }, [])
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Employees</h2>
        <Link to="/employees/new" className="px-3 py-1 bg-green-600 text-white rounded">Add</Link>
      </div>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} className="border-t"><td className="p-2">{u.firstName} {u.lastName}</td><td className="p-2">{u.email}</td><td className="p-2">Edit</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
