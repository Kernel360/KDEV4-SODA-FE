import { ReactNode } from "react"

export interface RequestAttachment {
  id: number
  type: 'file' | 'link'
  title: string
  url?: string
  fileName?: string
}

export interface RequestLink {
  urlAddress: string
  urlDescription: string
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface RequestAction {
  type: '승인' | '반려'
  actorName: string
  reason?: string
  links?: RequestLink[]
  createdAt: string
}

export interface Request {
  id: number
  title: string
  content: string
  status: '승인 대기중' | '승인됨' | '반려됨'
  attachments: RequestAttachment[]
  createdAt: string
  updatedAt: string
  action?: RequestAction
}

export interface TaskRequest {
  requestId: number
  title: string
  content: string
  status: RequestStatus
  links?: RequestLink[]
  files?: Array<{
    fileName: string
    fileUrl: string
  }>
  createdAt: string
  updatedAt: string
  requester?: {
    id: number
    name: string
  }
  processor?: {
    id: number
    name: string
  }
  processedAt?: string
  comment?: string
}

export interface CreateRequestData {
  title: string
  content: string
  projectId: number
  stageId: number
  taskId: number
  links: RequestLink[]
}

export interface UpdateRequestData {
  id: number
  title: string
  content: string
  links: RequestLink[]
}
