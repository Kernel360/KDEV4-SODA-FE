import axios from 'axios'

// interface ApiRequestOptions<T> {
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE'
//   url: string
//   data?: any
// }

export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'API 요청 중 오류가 발생했습니다.'
      )
    }
    throw error
  }
}
