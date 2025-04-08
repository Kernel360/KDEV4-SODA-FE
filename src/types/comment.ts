export interface Member {
  id: number
  name: string
}

export interface Comment {
  id: number
  content: string
  member: Member
  articleId: number
  parentCommentId?: number
  childComments: Comment[]
  createdAt: string
  updatedAt?: string
}

export interface CreateCommentRequest {
  projectId: number
  articleId: number
  content: string
  parentCommentId?: number
}

export interface CommentResponse {
  status: string
  code: string
  message: string
  data: Comment[]
}
