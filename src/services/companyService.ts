import { client } from '../api/client'
import axios from 'axios'

interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
}

interface CompanyMember {
  // Define the structure of a company member
}

export const companyService = {
  async getAllCompanies(): Promise<Company[]> {
    try {
      const response = await client.get('/companies')
      return response.data.data
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  },

  async updateCompanyStatus(
    companyId: number,
    isActive: boolean
  ): Promise<void> {
    try {
      await client.patch(`/companies/${companyId}/status`, { isActive })
    } catch (error) {
      console.error('Error updating company status:', error)
      throw error
    }
  },

  async getCompanyMembers(companyId: number): Promise<CompanyMember[]> {
    try {
      const response = await client.get(`/companies/${companyId}/members`)
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            '회사 멤버 목록을 불러오는데 실패했습니다.'
        )
      }
      throw error
    }
  }
}

export const getCompanyMembers = async (
  companyId: number
): Promise<CompanyMember[]> => {
  try {
    const response = await client.get(`/companies/${companyId}/members`)
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          '회사 멤버 목록을 불러오는데 실패했습니다.'
      )
    }
    throw error
  }
}
