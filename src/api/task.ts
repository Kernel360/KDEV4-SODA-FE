import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type { TaskRequestsResponse } from '../types/api'

export const getTaskRequests = async (taskId: number) => {
  return apiRequest<TaskRequestsResponse>('GET', API_ENDPOINTS.GET_TASK_REQUESTS(taskId))
} 