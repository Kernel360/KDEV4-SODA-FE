import axios from 'axios'

// interface ApiRequestOptions<T> {
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE'
//   url: string
//   data?: any
// }

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.s0da.co.kr/',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
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

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response = await api({
      method,
      url,
      data
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'API 요청 중 오류가 발생했습니다.'
      )
    }
    throw error
  }
}

export const API_ENDPOINTS = {
  // ... existing endpoints ...
  UPDATE_INFO: '/api/v1/auth/update-info'
  // ... existing endpoints ...
} as const
