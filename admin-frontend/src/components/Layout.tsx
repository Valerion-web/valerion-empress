import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { logout, getCurrentUser } from '../services/auth'

export default function Layout() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold">Valerion Admin</div>
        <nav className="p-4 space-y-2">
          <Link to="/" className="block p-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/employees" className="block p-2 rounded hover:bg-gray-100">Employees</Link>
          <Link to="/departments" className="block p-2 rounded hover:bg-gray-100">Departments</Link>
          <Link to="/attendance" className="block p-2 rounded hover:bg-gray-100">Attendance</Link>
          <Link to="/leaves" className="block p-2 rounded hover:bg-gray-100">Leaves</Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div>Welcome, {user?.firstName ?? 'Admin'}</div>
          <div className="space-x-2">
            <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => { logout(); navigate('/login') }}>Logout</button>
          </div>
        </header>
        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
