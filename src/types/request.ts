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
  requester: any
  requestId: number
  taskId: number
  memberId: number
  memberName: string
  title: string
  content: string
  links: Array<{
    id: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    fileUrl: string | undefined
    id: number
    name: string
    url: string
  }>
  status: string
  createdAt: string
  updatedAt: string
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
