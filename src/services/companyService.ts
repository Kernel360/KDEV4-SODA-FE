import { client } from '../api/client'
import type { Company } from '../types/company'
import type { CompanyMember } from '../types/api'

interface CreateCompanyRequest {
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
}

export const companyService = {
  async getAllCompanies(): Promise<Company[]> {
    const response = await client.get('/companies')
    return response.data.data
  },

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const response = await client.post('/companies', data)
    return response.data.data
  },

  async updateCompany(id: number, data: Partial<CreateCompanyRequest>): Promise<Company> {
    const response = await client.put(`/companies/${id}`, data)
    return response.data.data
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await client.get(`/companies/${id}`)
    return response.data.data
  },

  async updateCompanyStatus(companyId: number, isActive: boolean): Promise<void> {
    await client.patch(`/companies/${companyId}/status`, { isActive })
  },

  async getCompanyMembers(companyId: number): Promise<CompanyMember[]> {
    const response = await client.get(`/companies/${companyId}/members`)
    return response.data.data
  }
}
