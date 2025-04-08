export enum ArticleStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  COMMENTED = 'COMMENTED'
}

export enum PriorityType {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Author {
  id: number
  name: string
  email: string
}

export interface Article {
  id: number
  title: string
  content: string
  priority: PriorityType
  deadLine: string | null
  memberName: string
  stageName: string
  fileList: ArticleFile[]
  linkList: ArticleLink[]
  createdAt: string
  updatedAt: string
  status: ArticleStatus
}

export interface ArticleFile {
  id: number
  name: string
  url: string
}

export interface ArticleLink {
  id: number
  title: string
  url: string
}

export interface LinkUploadDTO {
  title: string
  url: string
}

export interface ArticleCreateRequest {
  projectId: number
  title: string
  content: string
  priority: PriorityType
  deadLine?: string
  memberId?: number
  stageId: number
  parentArticleId?: number
  linkList?: {
    urlAddress: string
    urlDescription: string
  }[]
}

export interface FileUploadDTO {
  name: string
  url: string
}

export interface ArticleCreateResponse {
  id: number
}
