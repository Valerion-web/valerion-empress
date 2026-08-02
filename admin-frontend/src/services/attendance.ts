import api from './api'

export async function fetchAttendance(params: any) {
  const res = await api.get('/attendance', { params })
  return res.data?.data
}

export async function fetchMonthlyAttendance(params: any) {
  const res = await api.get('/dashboard/attendance', { params })
  return res.data?.data
}
