import axios from 'axios'
import type { Project, ProjectStatus } from '../types/project'
import type { Task } from '../types/task'
import { client } from '../api/client'
import {
  Article,
  ArticleCreateRequest,
  ArticleCreateResponse,
  PriorityType
} from '../types/article'
import { ProjectMemberResponse } from '../types/project'

export interface CreateProjectRequest {
  title: string
  description: string
  startDate: string
  endDate: string
  stageNames: string[]
  clientAssignments: {
    companyId: number
    managerIds: number[]
    memberIds: number[]
  }[]
}

export interface UpdateProjectRequest {
  title: string
  description: string
  startDate: string
  endDate: string
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

export interface ProjectMemberSearchCondition {
  companyRole?: 'DEV_COMPANY' | 'CLIENT_COMPANY'
  companyId?: number
  memberRole?: string
}

export const projectService = {
  // 프로젝트 목록 조회
  async getAllProjects(status?: string, keyword?: string): Promise<Project[]> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (keyword) params.append('keyword', keyword)

      const response = await client.get(
        `/projects${params.toString() ? `?${params.toString()}` : ''}`
      )
      return response.data.data.content
    } catch (error) {
      console.error('Error fetching all projects:', error)
      throw error
    }
  },

  // 사용자의 프로젝트 목록 조회
  async getUserProjects(): Promise<Project[]> {
    try {
      console.log('프로젝트 목록 조회 시작')
      const response = await client.get('/projects/my')
      console.log('프로젝트 목록 조회 응답:', response)

      // 응답 형식에 따른 데이터 추출
      if (response.data?.data?.content) {
        return response.data.data.content
      } else if (response.data?.data) {
        return response.data.data
      } else if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('예상치 못한 응답 형식:', response)
        return []
      }
    } catch (error) {
      console.error('프로젝트 목록 조회 중 오류:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            '프로젝트 목록을 불러오는데 실패했습니다.'
        )
      }
      throw error
    }
  },

  // 프로젝트 상세 조회
  async getProjectById(id: number): Promise<Project> {
    try {
      const response = await client.get(`/projects/${id}`)
      if (response.data && response.data.data) {
        const projectData = response.data.data
        return {
          id: projectData.id,
          title: projectData.title,
          projectName: projectData.title,
          name: projectData.title,
          description: projectData.description,
          status: projectData.status,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          clientCompanyNames: projectData.clientCompanyNames || [],
          clientManagerNames: projectData.clientManagerNames || [],
          clientMemberNames: projectData.clientMemberNames || [],
          clientMembers: projectData.clientMembers || [],
          devCompanyNames: projectData.devCompanyNames || [],
          devManagerNames: projectData.devManagerNames || [],
          devMemberNames: projectData.devMemberNames || [],
          currentUserProjectRole: projectData.currentUserProjectRole,
          currentUserCompanyRole: projectData.currentUserCompanyRole,
          createdAt: projectData.createdAt || new Date().toISOString(),
          updatedAt: projectData.updatedAt || new Date().toISOString(),
          stages: projectData.stages || []
        }
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
      `https://api.s0da.co.kr/projects/${projectId}/stages`
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
        'stageNames',
        'clientAssignments'
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

      // 클라이언트 할당 검증
      if (project.clientAssignments.length === 0) {
        throw new Error('최소 하나의 고객사를 할당해야 합니다.')
      }

      // 각 고객사에 대한 담당자 검증
      for (const assignment of project.clientAssignments) {
        if (assignment.managerIds.length === 0) {
          throw new Error('각 고객사에 최소 한 명의 담당자를 지정해야 합니다.')
        }
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
  async updateProject(
    projectId: number,
    data: UpdateProjectRequest
  ): Promise<Project> {
    try {
      const response = await client.put(`/projects/${projectId}`, data)
      return response.data.data
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
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
    stageId?: number | null,
    searchType?: string,
    keyword?: string,
    page?: number,
    size?: number
  ): Promise<{ data: Article[] }> {
    const response = await client.get(`/projects/${projectId}/articles`, {
      params: {
        stageId: stageId || undefined,
        searchType: searchType || undefined,
        keyword: keyword || undefined,
        page: page || 0,
        size: size || 10,
        sort: []
      }
    })
    // API 응답 구조에 맞게 데이터 추출
    return {
      data: response.data.data?.content || []
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
      // 1. presigned URL 요청
      const presignedResponse = await client.post(`/articles/${articleId}/files/presigned-urls`, 
        files.map(file => ({
          fileName: file.name,
          contentType: file.type
        }))
      );

      if (presignedResponse.data.status === 'success') {
        const { entries } = presignedResponse.data.data;

        // 2. S3에 파일 업로드
        await Promise.all(
          entries.map((entry, i) =>
            axios.put(entry.presignedUrl, files[i], {
              headers: { 'Content-Type': files[i].type },
            })
          )
        );

        // 3. 업로드 완료 확인
        await client.post(`/articles/${articleId}/files/confirm-upload`,
          entries.map(entry => ({
            fileName: entry.fileName,
            url: entry.fileUrl
          }))
        );
      }
    } catch (error) {
      console.error('Failed to upload article files:', error);
      throw error;
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
  },

  // 프로젝트 멤버 조회
  async getProjectMembers(
    projectId: number,
    searchCondition: ProjectMemberSearchCondition,
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: ProjectMemberResponse[]
    totalElements: number
    totalPages: number
    number: number
    size: number
  }> {
    try {
      const response = await client.get(`/projects/${projectId}/members`, {
        params: {
          ...searchCondition,
          page,
          size
        }
      })
      return response.data.data
    } catch (error) {
      console.error('프로젝트 멤버 조회 실패:', error)
      throw error
    }
  },

  // 프로젝트 멤버 삭제
  async deleteProjectMember(
    projectId: number,
    memberId: number
  ): Promise<void> {
    try {
      await client.delete(`/projects/${projectId}/members/${memberId}`)
    } catch (error) {
      console.error('프로젝트 멤버 삭제 실패:', error)
      throw error
    }
  },

  // 프로젝트에 회사 추가
  async addProjectCompany(
    projectId: number,
    data: {
      companyId: number
      role: 'DEV_COMPANY' | 'CLIENT_COMPANY'
      managerIds: number[]
      memberIds: number[]
    }
  ): Promise<void> {
    try {
      await client.post(`/projects/${projectId}/companies`, data)
    } catch (error) {
      console.error('프로젝트 회사 추가 실패:', error)
      throw error
    }
  },

  async updateProjectStatus(
    projectId: number,
    status: ProjectStatus
  ): Promise<void> {
    await client.patch(`/projects/${projectId}/status`, { status })
  },

  async getUserRole(): Promise<string> {
    const response = await client.get('/projects/my/role')
    return response.data.data
  }
}
