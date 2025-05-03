export type NoticeType = 
  | 'NEW_COMMENT_ON_POST'
  | 'NEW_ARTICLE'
  | 'ARTICLE_STATUS_CHANGED'
  | 'PROJECT_STATUS_CHANGED'
  | 'NEW_PROJECT_MEMBER'
  | 'NEW_PROJECT_ASSIGNMENT'

export interface Notice {
  memberNoticeId: number
  notificationId: number
  type: NoticeType
  message: string
  link: string
  createdAt: string
  isRead: boolean
} 