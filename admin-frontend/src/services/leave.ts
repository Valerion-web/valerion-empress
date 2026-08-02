import api from './api'

export async function applyLeave(payload: any) { const res = await api.post('/leaves', payload); return res.data?.data }
export async function fetchLeaves(params: any) { const res = await api.get('/leaves', { params }); return res.data?.data }
export async function approveLeave(id: string) { const res = await api.post(`/leaves/${id}/approve`); return res.data?.data }
export async function rejectLeave(id: string) { const res = await api.post(`/leaves/${id}/reject`); return res.data?.data }
