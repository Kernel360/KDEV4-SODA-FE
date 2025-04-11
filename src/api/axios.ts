import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'https://api.s0da.co.kr/',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
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

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // 에러 처리 로직
    return Promise.reject(error)
  }
)
