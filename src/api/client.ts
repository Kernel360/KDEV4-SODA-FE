import axios from 'axios'
import { API_BASE_URL } from './config'
import type { ApiResponse } from '../types/api'

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 응답 인터셉터 설정
client.interceptors.response.use(
  (response) => {
    // Authorization 헤더에서 토큰 추출
    const token = response.headers['authorization']
    if (token) {
      // Bearer 제거하고 토큰만 저장
      localStorage.setItem('token', token.replace('Bearer ', ''))
    }
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 요청 인터셉터 설정
client.interceptors.request.use(
  (config) => {
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
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

interface ApiRequestOptions {
  headers?: Record<string, string>;
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
      }
    })
    console.log('API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('API Request Error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>
    }
    return {
      status: 'error',
      code: '500',
      message: '서버와의 통신 중 오류가 발생했습니다.',
    }
  }
} 