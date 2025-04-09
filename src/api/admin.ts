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

export const updateUserStatus = async (userId: number, active: boolean) => {
  const response = await instance.put<ApiResponse<null>>(
    `/admin/users/${userId}/status`,
    {
      active
    }
  )
  return response.data
}
