import axios from 'axios'
import { API_BASE_URL } from './config'
import type { ApiResponse } from '../types/api'

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // CORS 요청 시 쿠키를 포함
})

// 응답 인터셉터 설정
client.interceptors.response.use(
  response => {
    // Authorization 헤더에서 토큰 추출
    const token = response.headers['authorization']
    if (token) {
      // Bearer 제거하고 토큰만 저장
      localStorage.setItem('token', token.replace('Bearer ', ''))
    }
    return response
  },
  error => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    // 비밀번호 찾기 API 요청인 경우 401 에러를 그대로 전달
    const isPasswordResetRequest = error.config?.url?.includes('/verification')
    if (isPasswordResetRequest && error.response?.status === 401) {
      console.log('비밀번호 찾기 API 401 에러 - 리다이렉션하지 않음')
      return Promise.reject(error)
    }

    // 그 외의 경우 401 에러는 로그인 페이지로 리다이렉션
    if (error.response?.status === 401) {
      console.log('일반 API 401 에러 - 로그인 페이지로 리다이렉션')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 요청 인터셉터 설정
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // FormData인 경우 Content-Type 헤더 제거 (브라우저가 자동으로 설정)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    })
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

interface ApiRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
}

export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> => {
  try {
    const response = await client.request<ApiResponse<T>>({
      method,
      url,
      data,
      headers: {
        ...options?.headers
      },
      validateStatus: status => {
        if (url.includes('/verification') || url.includes('/password/reset')) {
          return status >= 200 && status < 500
        }
        return status >= 200 && status < 300
      }
    })
    console.log('API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('API Request Error:', error)
    if (axios.isAxiosError(error) && error.response) {
      if (
        (url.includes('/verification') || url.includes('/password/reset')) &&
        error.response.status === 401
      ) {
        return error.response.data
      }
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return {
          status: 'error',
          code: '401',
          message: '인증이 필요합니다.',
          data: null as T
        }
      }
      return error.response.data
    }
    return {
      status: 'error',
      code: '500',
      message: '서버와의 통신 중 오류가 발생했습니다.',
      data: null as T
    }
  }
}
