import { client } from './client'
import { Stage } from '../types/project'

export const createStage = async (projectId: number, name: string, prevStageId: number | null, nextStageId: number | null): Promise<Stage> => {
  const response = await client.post('/stages', {
    projectId,
    name,
    prevStageId,
    nextStageId
  })
  return response.data
}

export const updateStage = async (stageId: number, name: string) => {
  const response = await client.put(`/stages/${stageId}`, { name })
  return response.data
}

export const deleteStage = async (stageId: number) => {
  const response = await client.delete(`/stages/${stageId}`)
  return response.data
} 