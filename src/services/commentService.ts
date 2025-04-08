import axios from 'axios'
import type { Comment, CreateCommentRequest } from '@/types/comment'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export const commentService = {
  // 댓글 목록 조회
  async getComments(articleId: number): Promise<Comment[]> {
    const response = await axiosInstance.get(`/articles/${articleId}/comments`)
    console.log('Comments API Response:', response.data)
    return response.data.data || []
  },

  // 댓글 작성
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await axiosInstance.post('/comments', data)
    console.log('Create Comment Response:', response.data)
    return response.data.data
  },

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<void> {
    await axiosInstance.delete(`/comments/${commentId}`)
  }
}
