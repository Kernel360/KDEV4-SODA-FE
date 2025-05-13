import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type {
  CompanyCreateRequest,
  CompanyCreateResponse,
  CompanyListResponse,
  CompanyMemberListResponse,
  CompanyListItem
} from '../types/api'
import { api } from './api'

export const createCompany = async (data: CompanyCreateRequest) => {
  return apiRequest<CompanyCreateResponse>(
    'POST',
    API_ENDPOINTS.CREATE_COMPANY,
    data
  )
}

interface CompanyListParams {
  view?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  page?: number
  size?: number
  search?: string
}

export const getCompanyList = async (params: CompanyListParams = {}) => {
  try {
    const response = await api.get<CompanyListResponse>('/companies', {
      params
    })
    if (!response.data) {
      throw new Error('회사 목록을 가져오는데 실패했습니다.')
    }
    return response.data
  } catch (error) {
    console.error('회사 목록 조회 중 오류:', error)
    throw error
  }
}

export const searchCompanies = async (query: string) => {
  const response = await api.get<CompanyListResponse>('/companies/search', {
    params: { q: query }
  })
  return response.data
}

export const getCompanyMembers = async (companyId: number) => {
  return apiRequest<CompanyMemberListResponse>(
    'GET',
    `${API_ENDPOINTS.GET_COMPANIES}/${companyId}/members`
  )
}
