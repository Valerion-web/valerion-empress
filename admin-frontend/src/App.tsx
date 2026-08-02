import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardPage from './pages/Dashboard'
import Employees from './pages/employees/Employees'
import EmployeeForm from './pages/employees/EmployeeForm'
import Departments from './pages/departments/Departments'
import Attendance from './pages/attendance/Attendance'
import MonthlyReport from './pages/attendance/MonthlyReport'
import LeaveHistory from './pages/leaves/LeaveHistory'
import ApplyLeave from './pages/leaves/ApplyLeave'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        <Route path="departments" element={<Departments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/monthly" element={<MonthlyReport />} />
        <Route path="leaves" element={<LeaveHistory />} />
        <Route path="leaves/apply" element={<ApplyLeave />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
