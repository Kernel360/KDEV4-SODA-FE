import api from './api'

interface StageResponse {
  status: string
  code: string
  message: string
  data: {
    id: number
    name: string
    stageOrder: number
    status: string
    tasks: any[]
  }
}

interface CreateStageRequest {
  projectId: number
  name: string
  prevStageId: number | null
  nextStageId: number | null
}

interface MoveStageRequest {
  prevStageId: number | null
  nextStageId: number | null
}

export const createStage = async (data: CreateStageRequest): Promise<StageResponse> => {
  try {
    const response = await api.post<StageResponse>('/stages', data)
    return response.data
  } catch (error) {
    console.error('Failed to create stage:', error)
    throw error
  }
}

export const updateStage = async (stageId: number, name: string): Promise<StageResponse> => {
  try {
    const response = await api.put<StageResponse>(`/stages/${stageId}`, { name })
    return response.data
  } catch (error) {
    console.error('Failed to update stage:', error)
    throw error
  }
}

export const deleteStage = async (stageId: number): Promise<void> => {
  try {
    await api.delete(`/stages/${stageId}`)
  } catch (error) {
    console.error('Failed to delete stage:', error)
    throw error
  }
}

export const moveStage = async (stageId: number, data: MoveStageRequest): Promise<StageResponse> => {
  try {
    const response = await api.put<StageResponse>(`/stages/${stageId}/move`, data)
    return response.data
  } catch (error) {
    console.error('Failed to move stage:', error)
    throw error
  }
} 