import axios from 'axios'
import type { Project } from '../types/project'
import { client } from '../api/client'

const API_BASE_URL = 'http://localhost:8080'

const projectApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
projectApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token errors
projectApi.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      // You might want to redirect to login page or refresh token
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await client.get('/projects')
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          '프로젝트 목록을 불러오는데 실패했습니다.'
      )
    }
    throw error
  }
}

export const projectService = {
  // 프로젝트 목록 조회
  async getAllProjects(): Promise<Project[]> {
    const response = await client.get('/projects')
    return response.data.data
  },

  // 프로젝트 상세 조회
  async getProjectById(id: number): Promise<Project> {
    const response = await client.get(`/projects/${id}`)
    return response.data.data
  }
}
