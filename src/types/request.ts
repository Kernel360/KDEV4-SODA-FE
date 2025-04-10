import { ReactNode } from "react"

export type RequestStatus = '승인대기중' | '승인됨' | '반려됨'

export interface Request {
  content: ReactNode
  id: number
  title: string
  description: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  type: string
}
