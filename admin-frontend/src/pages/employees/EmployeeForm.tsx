import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'

export default function EmployeeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => { if (id) api.get(`/employees/${id}`).then(r => { const u = r.data.data; setFirstName(u.firstName); setLastName(u.lastName); setEmail(u.email) }) }, [id])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (id) await api.put(`/employees/${id}`, { firstName, lastName, email })
    else await api.post('/employees', { firstName, lastName, email })
    navigate('/employees')
  }

  return (
    <form onSubmit={save} className="max-w-lg bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">{id ? 'Edit' : 'Add'} Employee</h2>
      <label className="block mb-2">First name<input className="w-full p-2 border rounded" value={firstName} onChange={e => setFirstName(e.target.value)} /></label>
      <label className="block mb-2">Last name<input className="w-full p-2 border rounded" value={lastName} onChange={e => setLastName(e.target.value)} /></label>
      <label className="block mb-4">Email<input className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <div className="flex space-x-2"><button className="px-3 py-1 bg-blue-600 text-white rounded">Save</button><button type="button" onClick={() => navigate('/employees')} className="px-3 py-1 bg-gray-200 rounded">Cancel</button></div>
    </form>
  )
}
