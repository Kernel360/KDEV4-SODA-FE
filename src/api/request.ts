import { client } from './client'
import type { CreateRequestData, UpdateRequestData } from '../types/request'

export const getTaskRequests = async (taskId: number) => {
  const response = await client.get(`/tasks/${taskId}/requests`)
  return response.data
}

export const createTaskRequest = async (data: CreateRequestData) => {
  const response = await client.post('/requests', data)
  return response.data
}

export const updateTaskRequest = async (
  requestId: number,
  data: UpdateRequestData
) => {
  const response = await client.put(`/requests/${requestId}`, data)
  return response.data
}

export const deleteTaskRequest = async (requestId: number) => {
  const response = await client.delete(`/requests/${requestId}`)
  return response.data
}

export interface ApproveTaskRequestData {
  comment: string
  links?: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export const approveTaskRequest = async (requestId: number, data: ApproveTaskRequestData) => {
  const response = await client.post(`/requests/${requestId}/approval`, data)
  return response.data
}

export interface RejectTaskRequestData {
  comment: string
  links?: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export const rejectTaskRequest = async (requestId: number, data: RejectTaskRequestData) => {
  const response = await client.post(`/requests/${requestId}/rejection`, data)
  return response.data
}

export const uploadRequestFile = async (requestId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await client.post(`/requests/${requestId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}
