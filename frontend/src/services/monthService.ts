import { authService } from './authService'

import { API_BASE } from '../config'

function getHeaders(auth = true) {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function getMonths(batchYear?: string) {
  const url = batchYear ? `${API_BASE}/months?batchYear=${encodeURIComponent(batchYear)}` : `${API_BASE}/months`
  const res = await fetch(url, { method: 'GET', headers: getHeaders(false) })
  return res.json()
}

export async function getMonth(id: string) {
  const res = await fetch(`${API_BASE}/months/${id}`, { method: 'GET', headers: getHeaders(false) })
  return res.json()
}

export async function createMonth(payload: any) {
  const res = await fetch(`${API_BASE}/months`, { method: 'POST', headers: getHeaders(true), body: JSON.stringify(payload) })
  return res.json()
}

export async function updateMonth(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/months/${id}`, { method: 'PUT', headers: getHeaders(true), body: JSON.stringify(payload) })
  return res.json()
}

export async function deleteMonth(id: string) {
  const res = await fetch(`${API_BASE}/months/${id}`, { method: 'DELETE', headers: getHeaders(true) })
  return res.json()
}

export default { getMonths, getMonth, createMonth, updateMonth, deleteMonth }

