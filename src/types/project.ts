export interface Project {
  status: ProjectStatus
  projectName: string
  title: string
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  currentUserProjectRole: string
  currentUserCompanyRole: string
  clientCompanyNames: string[]
  devCompanyNames: string[]
  clientManagerNames: string[]
  devManagerNames: string[]
  clientMemberNames: string[]
  devMemberNames: string[]
  // For backward compatibility
  clientManagers?: Array<{
    id: number
    name: string
    companyName: string
  }>
  clientMembers?: Array<{
    id: number
    name: string
    companyName: string
  }>
  devManagers?: Array<{
    id: number
    name: string
    companyName: string
  }>
  devMembers?: Array<{
    id: number
    name: string
    companyName: string
  }>
  clientCompanyIds?: number[]
  devCompanyId?: number
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 
  | 'CONTRACT'      // 계약
  | 'IN_PROGRESS'   // 진행중
  | 'DELIVERED'     // 납품완료
  | 'MAINTENANCE'   // 하자보수
  | 'ON_HOLD'       // 일시중단
  | '진행중'        // For backward compatibility

export interface ProjectMember {
  id: number
  name: string
  email: string
  companyRole: string
  companyName: string
  role: string
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

export interface ProjectMemberResponse {
  id: number
  companyId: number
  companyName: string
  memberId: number
  memberName: string
  name?: string // For backward compatibility
  position: string
  phoneNumber: string
  email: string
  role: 'CLI_MANAGER' | 'CLI_PARTICIPANT' | 'DEV_MANAGER' | 'DEV_PARTICIPANT'
}
