import { client } from '../api/client'

export const requestService = {
  createRequest: async (data: any) => {
    const response = await client.post('/requests', data)
    return response.data.data
  },

  uploadRequestFiles: async (requestId: number, formData: FormData) => {
    const response = await client.post(`/requests/${requestId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.data
  }
} 