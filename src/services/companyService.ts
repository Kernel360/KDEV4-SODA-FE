import { client } from '../api/client'
import type { Company, CompanyFormData, CompanyMember } from '../types/company'
import type { ApiResponse, CompanyListResponse } from '../types/api'

interface AddMemberData {
  name: string
  position?: string
  email?: string
  phoneNumber?: string
}

export const companyService = {
  async getAllCompanies(params?: {
    view?: 'ACTIVE' | 'DELETED'
    searchKeyword?: string
    page?: number
    size?: number
  }): Promise<ApiResponse<CompanyListResponse>> {
    try {
      console.log('회사 목록 API 요청 시작:', {
        url: '/companies',
        params: {
          view: params?.view || 'ACTIVE',
          searchKeyword: params?.searchKeyword,
          page: params?.page,
          size: params?.size
        }
      })

      const response = await client.get<ApiResponse<CompanyListResponse>>(
        '/companies',
        {
          params: {
            view: params?.view || 'ACTIVE',
            searchKeyword: params?.searchKeyword,
            page: params?.page,
            size: params?.size
          }
        }
      )
      console.log('회사 목록 API 응답 성공:', response.data)
      return response.data
    } catch (error) {
      console.error('회사 목록 API 요청 실패:', {
        error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        }
      })
      throw error
    }
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await client.get<ApiResponse<Company>>(`/companies/${id}`)
    return response.data.data
  },

  async createCompany(data: CompanyFormData): Promise<Company> {
    const response = await client.post<ApiResponse<Company>>('/companies', data)
    return response.data.data
  },

  async updateCompany(
    id: number,
    data: Partial<CompanyFormData>
  ): Promise<Company> {
    const requestData = {
      ...data,
      detailAddress: data.detailAddress || null
    }
    const response = await client.put<ApiResponse<Company>>(
      `/companies/${id}`,
      requestData
    )
    return response.data.data
  },

  async updateCompanyStatus(
    companyId: number,
    isActive: boolean
  ): Promise<void> {
    await client.patch(`/companies/${companyId}/status`, { isActive })
  },

  async getCompanyMembers(companyId: number): Promise<CompanyMember[]> {
    const response = await client.get<ApiResponse<CompanyMember[]>>(
      `/companies/${companyId}/members`
    )
    return response.data.data
  },

  getCompanyDetail: async (companyId: number): Promise<Company> => {
    try {
      const response = await client.get<ApiResponse<Company>>(
        `/companies/${companyId}`
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching company detail:', error)
      throw error
    }
  },

  async deleteCompany(companyId: number): Promise<void> {
    await client.delete(`/companies/${companyId}`)
  },

  async restoreCompany(companyId: number): Promise<Company> {
    const response = await client.put<ApiResponse<Company>>(
      `/companies/${companyId}/restore`
    )
    return response.data.data
  },

  async addCompanyMember(
    companyId: number,
    data: AddMemberData
  ): Promise<CompanyMember> {
    const response = await client.post<ApiResponse<CompanyMember>>(
      `/companies/${companyId}/members`,
      data
    )
    return response.data.data
  },

  async updateMemberStatus(memberId: number, isActive: boolean): Promise<void> {
    await client.patch(`/members/${memberId}/status`, { isActive })
  },

  checkAuthIdAvailability: async (
    authId: string
  ): Promise<{ available: boolean }> => {
    try {
      const response = await client.get<ApiResponse<{ available: boolean }>>(
        `/check-id`,
        { params: { authId } }
      )
      return response.data.data
    } catch (error) {
      console.error('Error checking auth ID availability:', error)
      throw error
    }
  }
}
