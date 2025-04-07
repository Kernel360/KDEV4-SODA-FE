import axios from 'axios'
import type { Project } from '../types/project'

const API_BASE_URL = 'http://localhost:8080'

const projectApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await projectApi.get('/projects')
    return response.data
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
