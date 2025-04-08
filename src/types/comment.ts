export interface Member {
  id: number
  name: string
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  member: {
    id: number
    name: string
  }
  articleId: number
  deleted: boolean
  parentCommentId?: number
  childComments?: Comment[]
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
