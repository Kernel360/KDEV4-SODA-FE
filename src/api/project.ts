import { axiosInstance } from './axios'
import { API_ENDPOINTS } from './config'
import type { ProjectStagesResponse } from '../types/api'

export const getProjectStages = async (projectId: number): Promise<ProjectStagesResponse> => {
  const response = await axiosInstance.get<ProjectStagesResponse>(
    API_ENDPOINTS.GET_PROJECT_STAGES(projectId)
  )
  return response.data
} 