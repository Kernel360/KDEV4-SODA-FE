import { client } from '../api/client'
import type { Company, CompanyFormData } from '../types/company'
import type { ApiResponse } from '../types/api'
import type { CompanyMember } from '../types/api'

export const companyService = {
  async getAllCompanies(view: 'ACTIVE' | 'DELETED' = 'ACTIVE'): Promise<Company[]> {
    const response = await client.get<ApiResponse<Company[]>>(`/companies?view=${view}`)
    return response.data.data
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await client.get<ApiResponse<Company>>(`/companies/${id}`)
    return response.data.data
  },

  async createCompany(data: CompanyFormData): Promise<Company> {
    const response = await client.post<ApiResponse<Company>>('/companies', data)
    return response.data.data
  },

  async updateCompany(id: number, data: Partial<CompanyFormData>): Promise<Company> {
    const response = await client.put<ApiResponse<Company>>(`/companies/${id}`, data)
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
    const response = await client.put<ApiResponse<Company>>(`/companies/${companyId}/restore`)
    return response.data.data
  }
}
