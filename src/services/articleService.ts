import { axiosInstance } from '../api/axios'
import { Article, SearchType } from '../types/article'

interface ArticleSearchParams {
  page: number
  size: number
  searchType: SearchType
  searchKeyword?: string
  stageId?: number | null
}

interface ArticleResponse {
  status: string
  data: {
    content: Article[]
    totalPages: number
    totalElements: number
  }
}

export const articleService = {
  getArticlesByProjectId: async (
    projectId: number,
    params: ArticleSearchParams
  ): Promise<ArticleResponse> => {
    try {
      const response = await axiosInstance.get(
        `/projects/${projectId}/articles`,
        {
          params: {
            page: params.page,
            size: params.size,
            searchType: params.searchType,
            searchKeyword: params.searchKeyword,
            stageId: params.stageId
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      throw error
    }
  }
}
