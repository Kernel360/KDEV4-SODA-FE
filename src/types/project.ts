export interface Project {
  id: number
  title: string
  description: string
  devCompanyName: string
  clientCompanyName: string
  projectName: string
  startDate: string
  endDate: string
  status: ProjectStatus
  clientCompanyManagers: string[]
  clientCompanyMembers: string[]
  devCompanyManagers: string[]
  devCompanyMembers: string[]
}

export type ProjectStatus = '대기' | '진행 중' | '완료' | '중단'

export interface ProjectMember {
  id: number
  name: string
  email: string
  role: string
  companyId: number
  companyName: string
  position?: string
}

export interface Stage {
  id: number
  title: string
  order: number
  status: StageStatus
  startDate?: string
  endDate?: string
}

export type StageStatus = '대기' | '진행 중' | '완료' | '지연'
