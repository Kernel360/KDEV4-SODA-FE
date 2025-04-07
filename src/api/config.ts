export const API_BASE_URL = 'http://localhost:8080'

export const API_ENDPOINTS = {
  LOGIN: '/login',
  FIND_ID: '/members/find-id',
  FIND_PASSWORD: '/verification',
  VERIFY_CODE: '/verification/confirm',
  RESET_PASSWORD: '/password/change',
} as const 