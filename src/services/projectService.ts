import axios from 'axios'
import type { Project } from '../types/project'
import type { Stage } from '../types/stage'
import type { Task } from '../types/task'
import { client } from '../api/client'

const API_BASE_URL = 'http://localhost:8080'

// Request interceptor to add auth token
client.interceptors.request.use(
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

// Response interceptor to handle token errors
client.interceptors.response.use(
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
  },

  // 프로젝트 단계 조회
  async getProjectStages(projectId: number): Promise<Stage[]> {
    const response = await client.get(`/projects/${projectId}/stages`)
    return response.data.data
  },

  // 프로젝트 생성
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const response = await client.post('/projects', project)
    return response.data.data
  },

  // 프로젝트 수정
  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const response = await client.put(`/projects/${id}`, project)
    return response.data.data
  },

  // 프로젝트 삭제
  async deleteProject(id: number): Promise<void> {
    await client.delete(`/projects/${id}`)
  },

  async getStageTasks(stageId: number): Promise<Task[]> {
    try {
      const response = await client.get(`/stages/${stageId}/tasks`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching stage tasks:', error)
      throw error
    }
  }
}
