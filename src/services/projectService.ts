import axios from 'axios'
import type { Project } from '../types/project'
import type { Task } from '../types/task'
import { client } from '../api/client'
import {
  Article,
  ArticleCreateRequest,
  ArticleCreateResponse,
  PriorityType
} from '../types/article'

export interface CreateProjectRequest {
  title: string
  description: string
  startDate: string
  endDate: string
  clientCompanyIds: number[]
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
    if (response.data && response.data.data && response.data.data.content) {
      return response.data.data.content
    }
    throw new Error('프로젝트 데이터 형식이 올바르지 않습니다.')
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

interface ApiStage {
  id: number
  name: string
  stageOrder: number
  tasks: {
    taskId: number
    title: string
    content: string
    taskOrder: number
  }[]
}

export const projectService = {
  // 프로젝트 목록 조회
  async getAllProjects(): Promise<Project[]> {
    const response = await client.get('/projects')
    return response.data.data.content
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
    try {
      const response = await client.get(`/projects/${id}`)
      if (response.data && response.data.data) {
        return response.data.data
      }
      throw new Error('프로젝트 데이터 형식이 올바르지 않습니다.')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            '프로젝트 상세 정보를 불러오는데 실패했습니다.'
        )
      }
      throw error
    }
  },

  // 프로젝트 단계 조회
  async getProjectStages(projectId: number): Promise<ApiStage[]> {
    const response = await client.get(
      `http://localhost:8080/projects/${projectId}/stages`
    )
    return response.data.data
  },

  // 프로젝트 생성
  async createProject(project: CreateProjectRequest): Promise<Project> {
    try {
      // 필수 필드 검증
      const requiredFields = [
        'title',
        'description',
        'startDate',
        'endDate',
        'clientCompanyIds',
        'devCompanyId',
        'devManagers',
        'devMembers',
        'clientManagers',
        'clientMembers'
      ]

      const missingFields = requiredFields.filter(field => {
        const value = project[field as keyof CreateProjectRequest]
        return (
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')
        )
      })

      if (missingFields.length > 0) {
        throw new Error(
          `다음 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`
        )
      }

      // 날짜 유효성 검증
      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)

      if (startDate >= endDate) {
        throw new Error('종료일은 시작일보다 이후여야 합니다.')
      }

      // 회사 ID 유효성 검증
      if (project.clientCompanyIds.includes(project.devCompanyId)) {
        throw new Error('고객사와 개발사는 서로 다른 회사여야 합니다.')
      }

      // 담당자 유효성 검증
      if (project.devManagers.length === 0) {
        throw new Error('개발사 담당자는 최소 1명 이상이어야 합니다.')
      }

      if (project.clientManagers.length === 0) {
        throw new Error('고객사 담당자는 최소 1명 이상이어야 합니다.')
      }

      const response = await client.post('/projects', project)

      if (response.data.status === 'success') {
        return response.data.data
      } else {
        throw new Error(
          response.data.message || '프로젝트 생성에 실패했습니다.'
        )
      }
    } catch (error) {
      console.error('Error in createProject:', error)
      throw error
    }
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
      return response.data
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
  },

  // 게시글 수정
  async updateArticle(
    articleId: number,
    data: {
      projectId: number
      title: string
      content: string
      deadLine: string
      memberId: number
      stageId: number
      priority: PriorityType
    }
  ): Promise<Article> {
    try {
      const response = await client.put(`/articles/${articleId}`, data)
      if (response.data.status === 'success') {
        return response.data.data
      }
      throw new Error(response.data.message || '게시글 수정에 실패했습니다.')
    } catch (error) {
      console.error('Error updating article:', error)
      throw error
    }
  },

  // 게시글 링크 삭제
  async deleteArticleLink(articleId: number, linkId: number): Promise<void> {
    try {
      const response = await client.delete(
        `/articles/${articleId}/links/${linkId}`
      )
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || '링크 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting article link:', error)
      throw error
    }
  },

  // 게시글 파일 삭제
  async deleteArticleFile(articleId: number, fileId: number): Promise<void> {
    try {
      const response = await client.delete(
        `/articles/${articleId}/files/${fileId}`
      )
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || '파일 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting article file:', error)
      throw error
    }
  }
}
