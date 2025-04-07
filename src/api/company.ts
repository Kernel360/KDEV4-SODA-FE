import axios from 'axios'
import { Company, CompanyCreateRequest } from '../types/api'

const API_URL = 'http://localhost:8080'

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    console.log('Current access token:', accessToken)
    
    if (!accessToken) {
      throw new Error('No access token found')
    }

    console.log('Making API request to:', `${API_URL}/companies`)
    const response = await axios.get(`${API_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('API response:', response)
    
    // API 응답에서 data 필드 안의 회사 목록을 반환
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
    }
    console.error('Error fetching companies:', error)
    throw error
  }
}

export const createCompany = async (data: CompanyCreateRequest) => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      throw new Error('No access token found')
    }

    console.log('Creating company with data:', data)
    console.log('Using access token:', accessToken)

    const response = await axios.post(`${API_URL}/companies`, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('Company created successfully:', response.data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      })
    }
    console.error('Error creating company:', error)
    throw error
  }
} 