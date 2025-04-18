import { ReactNode } from 'react'

export interface Project {
  projectName: string
  id: number
  title: string
  description: string
  clientCompanyName: ReactNode
  devCompanyName: ReactNode
  status: ProjectStatus
  startDate: string
  endDate: string
  clientCompanyIds: number[]
  devCompanyId: number
  clientCompanyManagers: number[]
  clientCompanyMembers: number[]
  devCompanyManagers: number[]
  devCompanyMembers: number[]
}

export type ProjectStatus = 
  | 'CONTRACT'      // 계약
  | 'IN_PROGRESS'   // 진행중
  | 'DELIVERED'     // 납품완료
  | 'MAINTENANCE'   // 하자보수
  | 'ON_HOLD'       // 일시중단

export interface ProjectMember {
  id: number
  name: string
  position?: string
  phoneNumber?: string
  email?: string
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
