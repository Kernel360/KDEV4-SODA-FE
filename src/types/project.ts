export interface Project {
  clientMembers: never[]
  devManagers: never[]
  devMembers: never[]
  clientManagers: never[]
  id: number
  title: string
  description: string
  projectName: string
  status: string
  startDate: string
  endDate: string
  clientCompanyId: number
  devCompanyId: number
  clientCompanyName: string
  devCompanyName: string
  clientCompanyManagers: string[]
  clientCompanyMembers: string[]
  devCompanyManagers: string[]
  devCompanyMembers: string[]
}

export type ProjectStatus =
  | '계약'
  | '진행중'
  | '납품완료'
  | '하자보수'
  | '일시중단'

export interface ProjectMember {
  id: number
  name: string
  email: string
  role: string
  companyId: number
  companyName: string
  position?: string
}

export type StageStatus = '대기' | '진행중' | '완료'
export type TaskStatus = '대기' | '진행중' | '완료'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  order: number
  stageId: number
  createdAt: string
  updatedAt: string
  requests: any[]
}

export interface Stage {
  id: number
  title: string
  name: string
  description?: string
  stageOrder: number
  order: number
  status: StageStatus
  tasks: Task[]
  projectId?: number
}

export interface ProjectWithProgress extends Project {
  progress: number
  stages: Stage[]
}
