import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type {
  CompanyCreateRequest,
  CompanyCreateResponse,
  CompanyListResponse,
  CompanyMemberListResponse
} from '../types/api'

export const createCompany = async (data: CompanyCreateRequest) => {
  return apiRequest<CompanyCreateResponse>(
    'POST',
    API_ENDPOINTS.CREATE_COMPANY,
    data
  )
}

export const getCompanyList = async (params?: {
  view?: 'ACTIVE' | 'DELETED'
  searchKeyword?: string
  page?: number
  size?: number
}) => {
  return apiRequest<CompanyListResponse>('GET', API_ENDPOINTS.GET_COMPANIES, undefined, { params })
}

export const getCompanyMembers = async (companyId: number) => {
  return apiRequest<CompanyMemberListResponse>(
    'GET',
    `${API_ENDPOINTS.GET_COMPANIES}/${companyId}/members`
  )
}
