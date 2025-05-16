import { client } from '../api/client'
import type { MemberStatus } from '../types/member'

export const memberService = {
  // 마이페이지 정보 조회
  async getMyInfo(): Promise<{
    id: number
    authId: string
    name: string
    email: string
    role: string
    position: string
    phoneNumber: string
    companyId: number
    companyName: string
    createdAt: string
    updatedAt: string
    deleted: boolean
  }> {
    try {
      const response = await client.get('/members/my')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my info:', error)
      throw error
    }
  },

  // 마이페이지 정보 수정
  async updateMyInfo(data: {
    name?: string
    email?: string
    phoneNumber?: string
    position?: string
  }): Promise<void> {
    try {
      await client.put('/members/my', data)
    } catch (error) {
      console.error('Error updating my info:', error)
      throw error
    }
  },

  async updateMemberStatus(memberId: number, newStatus: MemberStatus) {
    try {
      const response = await client.patch(`/members/${memberId}/status`, {
        newStatus
      })
      return response.data
    } catch (error) {
      console.error('Failed to update member status:', error)
      throw error
    }
  }
}
