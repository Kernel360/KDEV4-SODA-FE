import { instance } from './config'
import type { ApiResponse, MemberListDto, PagedData } from '../types/api'

export const getUsers = async (
  page: number,
  size: number,
  searchKeyword?: string
) => {
  const response = await instance.get<ApiResponse<PagedData<MemberListDto>>>(
    '/admin/members',
    {
      params: {
        page,
        size,
        searchKeyword
      }
    }
  )
  return response.data
}

export const getUserDetail = async (userId: number) => {
  const response = await instance.get<ApiResponse<any>>(
    `/admin/members/${userId}`
  )
  return response.data
}

export const updateUserStatus = async (userId: number, active: boolean) => {
  const response = await instance.put<ApiResponse<null>>(
    `/admin/members/${userId}/status`,
    {
      active
    }
  )
  return response.data
}

// 회사 목록 조회
export const getCompanies = async () => {
  try {
    const response = await instance.get('/companies')
    return response.data
  } catch (error) {
    console.error('회사 목록 조회 중 오류:', error)
    throw error
  }
}

// 사용자 정보 수정
export const updateUser = async (
  userId: number,
  userData: {
    name: string
    email: string
    role: string
    companyId: number
    position: string
    phoneNumber: string
  }
) => {
  try {
    const response = await instance.put(`/admin/members/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('사용자 정보 수정 중 오류:', error)
    throw error
  }
}
