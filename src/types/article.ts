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
  status: ArticleStatus
  priority: PriorityType
  deadLine: string | null
  createdAt: string
  updatedAt: string
  userName: string
  parentArticleId: number | null
  children: Article[]
  links?: ArticleLinkDTO[]
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
  linkList?: LinkUploadDTO[]
}

export interface ArticleFileDTO {
  id: number
  name: string
  url: string
}

export interface ArticleLinkDTO {
  id: number
  title: string
  url: string
}

export interface ArticleCreateResponse {
  title: string
  content: string
  priority: PriorityType
  deadLine?: string
  memberName: string
  stageName: string
  parentArticleId?: number
  fileList: ArticleFileDTO[]
  linkList: ArticleLinkDTO[]
}
