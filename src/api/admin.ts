import { instance } from './config'
import type { ApiResponse, MemberListDto, PagedData } from '../types/api'

export const getUsers = async (page: number, size: number, search?: string) => {
  const response = await instance.get<ApiResponse<PagedData<MemberListDto>>>(
    '/admin/users',
    {
      params: {
        page,
        size,
        search
      }
    }
  )
  return response.data
}

export const getUserDetail = async (userId: number) => {
  const response = await instance.get<ApiResponse<any>>(`/admin/users/${userId}`)
  return response.data
}

export const updateUserStatus = async (userId: number, active: boolean) => {
  const response = await instance.put<ApiResponse<null>>(
    `/admin/users/${userId}/status`,
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
export const updateUser = async (userId: number, userData: any) => {
  try {
    const response = await instance.put(`/admin/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('사용자 정보 수정 중 오류:', error)
    throw error
  }
}
