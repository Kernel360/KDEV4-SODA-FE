import { API_ENDPOINTS } from './config'
import { apiRequest } from './api'
import type {
  TaskRequestsResponse,
  ProjectStageTask,
  ApiResponse
} from '../types/api'
import { client } from './client'

// API 응답 타입 정의
export interface ApprovalResponse {
  responseId: number
  comment: string
  links?: { id: number; urlAddress: string; urlDescription: string }[]
  files?: { fileId: number; fileName: string; fileUrl: string }[]
  status: string
  createdAt: string
}

// 요청 생성 응답 타입 정의
export interface CreateRequestResponse {
  requestId: number
  title: string
  content: string
  status: string
  links?: { id: number; urlAddress: string; urlDescription: string }[]
  createdAt: string
}

export const getTaskRequests = async (taskId: number) => {
  return apiRequest<TaskRequestsResponse>(
    'GET',
    API_ENDPOINTS.GET_TASK_REQUESTS(taskId)
  )
}

export interface ApprovalRequestBody {
  comment: string
  links?: { urlAddress: string; urlDescription: string }[]
}

export const approveTaskRequest = async (
  requestId: number,
  data: ApprovalRequestBody
) => {
  // 타입 지정
  return apiRequest<ApprovalResponse>(
    'POST',
    API_ENDPOINTS.APPROVE_REQUEST(requestId),
    data
  )
}

export interface CreateTaskRequestData {
  title: string
  content: string
  projectId: number
  stageId: number
  taskId: number
  links?: { urlAddress: string; urlDescription: string }[]
}

export const createTaskRequest = async (data: CreateTaskRequestData) => {
  // JSON 형식으로 요청
  return apiRequest<CreateRequestResponse>('POST', '/requests', data)
}

export const deleteTaskRequest = async (requestId: number) => {
  return apiRequest('DELETE', `/requests/${requestId}`)
}

export interface UpdateTaskRequestData {
  title: string
  content: string
  links?: { urlAddress: string; urlDescription: string }[]
}

export const updateTaskRequest = async (
  requestId: number,
  data: UpdateTaskRequestData
) => {
  return apiRequest('PUT', `/requests/${requestId}`, data)
}

export const uploadRequestFiles = async (requestId: number, files: File[]) => {
  const formData = new FormData()

  files.forEach(file => {
    formData.append('file', file)
  })

  return apiRequest('POST', `/requests/${requestId}/files`, formData)
}

export const deleteRequestLink = async (requestId: number, linkId: number) => {
  return apiRequest('DELETE', `/requests/${requestId}/links/${linkId}`)
}

export const deleteRequestFile = async (requestId: number, fileId: number) => {
  return apiRequest('DELETE', `/requests/${requestId}/files/${fileId}`)
}

export interface RejectionRequestBody {
  comment: string
  projectId: number
  links?: { urlAddress: string; urlDescription: string }[]
}

export const rejectTaskRequest = async (
  requestId: number,
  data: RejectionRequestBody
) => {
  // FormData 대신 JSON 형식으로 요청
  return apiRequest<ApprovalResponse>(
    'POST',
    API_ENDPOINTS.REJECT_REQUEST(requestId),
    data
  )
}

export interface CreateTaskResponseRequest {
  content: string
  links?: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export interface CreateTaskResponseResponse {
  responseId: number
  content: string
  links: Array<{
    linkId: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    fileId: number
    fileName: string
    fileUrl: string
  }>
  createdAt: string
  updatedAt: string
}

export const getTaskResponses = async (taskId: number): Promise<any> => {
  return apiRequest('GET', `/tasks/${taskId}/responses`)
}

export const createTaskResponse = async (
  taskId: number,
  data: CreateTaskResponseRequest
): Promise<any> => {
  return apiRequest('POST', `/tasks/${taskId}/responses`, data)
}

export const updateTaskResponse = async (
  responseId: number,
  data: {
    comment: string
    projectId: number
    links: { urlAddress: string; urlDescription: string }[]
  }
) => {
  return await apiRequest('PUT', `/responses/${responseId}`, data)
}

export const deleteTaskResponse = async (responseId: number): Promise<any> => {
  return apiRequest('DELETE', `/responses/${responseId}`)
}

export const uploadResponseFiles = async (
  responseId: number,
  files: File[]
) => {
  const formData = new FormData()

  files.forEach(file => {
    formData.append('file', file)
  })

  return apiRequest('POST', `/responses/${responseId}/files`, formData)
}

export const deleteResponseLink = async (
  responseId: number,
  linkId: number
): Promise<any> => {
  return apiRequest('DELETE', `/responses/${responseId}/links/${linkId}`)
}

export const deleteResponseFile = async (
  responseId: number,
  fileId: number
): Promise<any> => {
  return apiRequest('DELETE', `/responses/${responseId}/files/${fileId}`)
}

export const getRequestResponses = async (requestId: number) => {
  return apiRequest<ApprovalResponse[]>(
    'GET',
    `/requests/${requestId}/responses`
  )
}

export const getTaskDetail = async (
  taskId: number
): Promise<ApiResponse<ProjectStageTask>> => {
  return apiRequest<ApiResponse<ProjectStageTask>>('GET', `/tasks/${taskId}`)
}

export const updateTask = async (
  taskId: number,
  data: Partial<ProjectStageTask>
) => {
  return apiRequest<ProjectStageTask>('PUT', `/tasks/${taskId}`, data)
}

export const deleteTask = async (
  taskId: number
): Promise<ApiResponse<void>> => {
  return apiRequest<ApiResponse<void>>('DELETE', `/tasks/${taskId}`)
}

export interface CreateTaskRequest {
  stageId: number
  title: string
  content: string
  prevTaskId?: number
  nextTaskId?: number
}

export const createTask = async (data: CreateTaskRequest) => {
  const response = await client.post('http://localhost:8080/tasks', data)
  return response.data
}
