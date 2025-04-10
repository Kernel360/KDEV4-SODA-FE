export interface Stage {
  id: number
  name: string
  order: number
  tasks: Task[]
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  order: number
  requests?: Request[]
  createdAt: string
  updatedAt: string
}

export type TaskStatus = '대기' | '진행 중' | '완료' | '중단'

export interface Request {
  id: number
  title: string
  description: string
  status: RequestStatus
  attachments: RequestAttachment[]
  action?: RequestAction
  createdAt: string
  updatedAt: string
}

export type RequestStatus = '대기' | '진행 중' | '완료' | '중단'
export type RequestAction = '승인' | '반려'

export interface RequestAttachment {
  id: number
  name: string
  url: string
  type: string
  size: number
}
