import axios from 'axios'
import type { Project } from '../types/project'
import type { Stage } from '../types/stage'
import type { Task } from '../types/task'
import { client } from '../api/client'
import {
  Article,
  ArticleCreateRequest,
  ArticleCreateResponse
} from '../types/article'

export interface CreateProjectRequest {
  title: string
  description: string
  startDate: string
  endDate: string
  clientCompanyId: number
  devCompanyId: number
  devManagers: number[]
  devMembers: number[]
  clientManagers: number[]
  clientMembers: number[]
}

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

  // 사용자의 프로젝트 목록 조회
  async getUserProjects(): Promise<Project[]> {
    try {
      const response = await client.get('/projects/my')
      if (response.data && response.data.data) {
        return response.data.data
      }
      throw new Error('프로젝트 데이터 형식이 올바르지 않습니다.')
    } catch (error) {
      console.error('Error fetching user projects:', error)
      throw error
    }
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
  async createProject(project: CreateProjectRequest): Promise<Project> {
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
  },

  async getProjectArticles(
    projectId: number,
    stageId?: number | null
  ): Promise<Article[]> {
    try {
      const response = await client.get(`/projects/${projectId}/articles`, {
        params: { stageId }
      })
      return response.data.data
    } catch (error) {
      console.error('Error fetching project articles:', error)
      throw error
    }
  },

  async createArticle(
    projectId: number,
    request: ArticleCreateRequest
  ): Promise<ArticleCreateResponse> {
    try {
      const response = await client.post('/articles', {
        projectId,
        title: request.title,
        content: request.content,
        priority: request.priority,
        deadLine: request.deadLine,
        stageId: request.stageId,
        parentArticleId: request.parentArticleId,
        linkList: request.linkList || []
      })
      console.log('Create article response:', response.data)
      if (!response.data || !response.data.data || !response.data.data.id) {
        throw new Error('Invalid response format from create article API')
      }
      return response.data.data
    } catch (error) {
      console.error('Error creating article:', error)
      throw error
    }
  },

  async uploadArticleFiles(articleId: number, files: File[]): Promise<void> {
    try {
      if (!articleId) {
        throw new Error('Article ID is required for file upload')
      }

      const formData = new FormData()
      files.forEach(file => {
        formData.append('file', file)
      })

      const response = await client.post(
        `/articles/${articleId}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      console.log('File upload response:', response.data)
    } catch (error) {
      console.error('Error uploading files:', error)
      throw error
    }
  },

  async getArticleDetail(
    projectId: number,
    articleId: number
  ): Promise<Article> {
    try {
      console.log('Fetching article detail for:', { projectId, articleId })
      const response = await client.get(
        `/projects/${projectId}/articles/${articleId}`
      )
      console.log('API Response:', response)
      if (!response.data) {
        throw new Error('No data received from API')
      }
      if (!response.data.data) {
        throw new Error('Article data is missing in response')
      }
      return response.data.data
    } catch (error) {
      console.error('Error fetching article detail:', error)
      throw error
    }
  },

  // 게시글 삭제
  async deleteArticle(projectId: number, articleId: number): Promise<void> {
    await client.delete(`/projects/${projectId}/articles/${articleId}`)
  }
}
