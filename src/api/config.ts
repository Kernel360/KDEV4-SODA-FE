import axios from 'axios'

export const API_BASE_URL = 'https://api.s0da.co.kr'

export const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const API_ENDPOINTS = {
  LOGIN: '/login',
  FIND_ID: '/members/find-id',
  FIND_PASSWORD: '/find-password',
  VERIFY_CODE: '/verify-code',
  RESET_PASSWORD: '/reset-password',
  CREATE_COMPANY: '/companies',
  GET_COMPANIES: '/companies',
  GET_COMPANY_MEMBERS: (companyId: number) => `/companies/${companyId}/members`,
  SIGNUP: '/signup',
  GET_TASK_REQUESTS: (taskId: number) => `/tasks/${taskId}/requests`,
  GET_PROJECT_STAGES: (projectId: number) => `/projects/${projectId}/stages`,
  APPROVE_REQUEST: (requestId: number) => `/requests/${requestId}/approval`,
  REJECT_REQUEST: (requestId: number) => `/requests/${requestId}/rejection`
} as const
