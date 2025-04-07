export enum ArticleStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum PriorityType {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Article {
  id: number
  title: string
  userName: string
  status: ArticleStatus
  priority: PriorityType
  deadLine: string
  createdAt: string
  parentArticleId: number | null
  children: Article[]
}
