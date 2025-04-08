import { client } from '../api/client'
import type { Comment, CreateCommentRequest } from '../types/comment'

export const commentService = {
  // 댓글 목록 조회
  async getComments(articleId: number): Promise<Comment[]> {
    const response = await client.get(`/articles/${articleId}/comments`)
    console.log('Comments API Response:', response.data)
    return response.data.data || []
  },

  // 댓글 작성
  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const response = await client.post('/comments', request)
    console.log('Create Comment Response:', response.data)
    return response.data.data
  },

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<void> {
    await client.delete(`/comments/${commentId}`)
  }
}
