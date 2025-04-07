import { Company, Member } from './api'

export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  members: Member[]
  companies: Company[]
}
