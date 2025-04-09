import { client } from '../api/client'

interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
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
  }
}
