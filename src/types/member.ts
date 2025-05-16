export interface Member {
  id: number
  name: string
  email: string
  phoneNumber: string
  position?: string
  department?: string
  createdAt: string
  updatedAt: string
}

export interface Profile extends Member {
  profileImage?: string
  bio?: string
}

export type MemberStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'ON_VACATION'

export const MemberStatusDescription: Record<MemberStatus, string> = {
  AVAILABLE: '업무 가능',
  BUSY: '바쁨',
  AWAY: '자리 비움',
  ON_VACATION: '휴가중'
}

export const MemberStatusWorkable: Record<MemberStatus, boolean> = {
  AVAILABLE: true,
  BUSY: false,
  AWAY: true,
  ON_VACATION: false
}
