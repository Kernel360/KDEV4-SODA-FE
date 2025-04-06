export const API_BASE_URL = 'http://localhost:8080'

export const API_ENDPOINTS = {
  LOGIN: '/login',
  FIND_ID: '/members/find-id',
  FIND_PASSWORD: '/find-password',
  VERIFY_CODE: '/verify-code',
  RESET_PASSWORD: '/reset-password',
} as const 