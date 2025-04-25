export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PriorityType {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum SearchType {
  TITLE_CONTENT = 'TITLE_CONTENT',
  TITLE = 'TITLE',
  CONTENT = 'CONTENT'
}

export interface Author {
  id: number
  name: string
  email: string
}

export interface VoteItem {
  itemId: number
  content: string
  voteCount?: number
}

export interface Vote {
  id: number
  title: string
  deadLine?: string
  closed: boolean
  items: VoteItem[]
  allowMultipleSelection: boolean
  allowTextAnswer: boolean
}

export interface Article {
  id: number
  title: string
  content: string
  status: 'PENDING' | 'COMMENTED'
  priority: string
  createdAt: string
  updatedAt: string
  userName: string
  children?: Article[]
  deleted: boolean
  projectId?: number
  projectName?: string
  stageId?: number
  stageName?: string
  deadLine?: string
  fileList?: ArticleFileDTO[]
  linkList?: ArticleLinkDTO[]
}

export interface ArticleFile {
  id: number
  name: string
  url: string
  deleted?: boolean
}

export interface ArticleLink {
  id: number
  urlAddress: string
  urlDescription: string
  deleted?: boolean
}

export interface LinkUploadDTO {
  urlAddress: string
  urlDescription: string
}

export interface ArticleCreateRequest {
  projectId: number
  title: string
  content: string
  priority: PriorityType
  deadLine?: string
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
  status: string
  code: string
  message: string
  data: {
    id: number
  }
}

export interface ArticleUpdateRequest {
  projectId: number
  title: string
  content: string
  priority: PriorityType
  deadLine: string
  memberId: number
  stageId: number
  linkList: LinkUploadDTO[]
}

export interface ArticleUpdateResponse {
  id: number
  title: string
  content: string
  priority: PriorityType
  deadLine: string
  memberName: string
  stageName: string
  fileList: ArticleFileDTO[]
  linkList: ArticleLinkDTO[]
}

export interface ArticleFileDTO {
  id: number
  fileName: string
  fileUrl: string
}

export interface ArticleLinkDTO {
  id: number
  urlAddress: string
  urlDescription: string
}
