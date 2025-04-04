export interface Comment {
  id: number
  content: string
  author: {
    id: number
    name: string
    email: string
  }
  createdAt: string
  replies?: Comment[]
  parentId?: number
}
