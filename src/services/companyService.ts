import { client } from '../api/client'
import type { Company } from '../types/company'
import type { CompanyMember } from '../types/api'

interface CreateCompanyRequest {
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailaddress: string
  ownerName: string
}

interface ApiResponse<T> {
  status: string
  code: string
  message: string
  data: T
}

export const companyService = {
  async getAllCompanies(): Promise<Company[]> {
    const response = await client.get<ApiResponse<Company[]>>('/companies')
    return response.data.data
  },

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const response = await client.post<ApiResponse<Company>>('/companies', data)
    return response.data.data
  },

  async updateCompany(
    id: number,
    data: Partial<CreateCompanyRequest>
  ): Promise<Company> {
    const response = await client.put<ApiResponse<Company>>(
      `/companies/${id}`,
      data
    )
    return response.data.data
  },

  async getCompanyById(id: number): Promise<Company> {
    try {
      const response = await client.get<ApiResponse<Company>>(
        `/companies/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching company detail:', error)
      throw error
    }
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
    try {
      await client.delete(`/companies/${companyId}`)
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  }
}
