import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type { LoginRequest, LoginResponse } from '../types/api'

export async function login(data: LoginRequest) {
  return apiRequest<LoginResponse>('POST', API_ENDPOINTS.LOGIN, data)
}

export async function findId(data: { name: string; phoneNumber: string }) {
  return apiRequest('POST', API_ENDPOINTS.FIND_ID, data)
}

export async function requestPasswordReset(data: { email: string }) {
  return apiRequest('POST', API_ENDPOINTS.FIND_PASSWORD, data)
}

export async function verifyCode(data: { email: string; code: string }) {
  return apiRequest('POST', API_ENDPOINTS.VERIFY_CODE, data)
}

export async function resetPassword(data: { email: string; password: string; code: string }) {
  return apiRequest('POST', API_ENDPOINTS.RESET_PASSWORD, data)
} 