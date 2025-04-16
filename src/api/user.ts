import { apiRequest } from './client'
import type { ApiResponse } from '../types/api'

interface DashboardItem {
  id: number
  title: string
  date: string
  status?: string
}

interface DashboardData {
  recentRequests: DashboardItem[]
  recentQuestions: DashboardItem[]
  ongoingProjects: DashboardItem[]
}

export const getUserDashboard = async (): Promise<ApiResponse<DashboardData>> => {
  return apiRequest('GET', '/user/dashboard')
}

export const getRecentRequests = async (): Promise<ApiResponse<DashboardItem[]>> => {
  return apiRequest('GET', '/user/requests/recent')
}

export const getRecentQuestions = async (): Promise<ApiResponse<DashboardItem[]>> => {
  return apiRequest('GET', '/user/questions/recent')
}

export const getOngoingProjects = async (): Promise<ApiResponse<DashboardItem[]>> => {
  return apiRequest('GET', '/user/projects/ongoing')
} 