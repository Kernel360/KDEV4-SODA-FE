import { client } from '../api/client'
import type { LogResponse, LogQueryParams } from '../types/log'

export const logService = {
  getLogs: async (params: LogQueryParams): Promise<LogResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params.entityName) queryParams.append('entityName', params.entityName)
    if (params.action) queryParams.append('action', params.action)
    if (params.from) queryParams.append('from', params.from)
    if (params.to) queryParams.append('to', params.to)
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.size !== undefined) queryParams.append('size', params.size.toString())

    const response = await client.get(`/logs?${queryParams.toString()}`)
    return response.data
  }
} 