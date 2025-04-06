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
    // Authorization 헤더에서 액세스 토큰 추출
    const accessToken = response.headers['authorization']
    if (accessToken) {
      // Bearer 제거하고 토큰만 저장
      localStorage.setItem('accessToken', accessToken.replace('Bearer ', ''))
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 요청 인터셉터 설정
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await client.request<ApiResponse<T>>({
      method,
      url,
      data,
    })
    return response.data
  } catch (error) {
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