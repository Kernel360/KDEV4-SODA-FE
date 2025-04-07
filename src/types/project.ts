export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  clientCompanyName: string
  clientCompanyManagers: string[]
  clientCompanyMembers: string[]
  devCompanyName: string
  devCompanyManagers: string[]
  devCompanyMembers: string[]
}
