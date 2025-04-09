export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  title: string
  description: string
  projectNumber: string
  status: string
  startDate: string
  endDate: string
  clientCompanyName: string
  clientCompanyManagers: {
    name: string
    position: string
    email: string
  }[]
  clientCompanyMembers: {
    name: string
    position: string
    email: string
  }[]
  devCompanyName: string
  devCompanyManagers: {
    name: string
    position: string
    email: string
  }[]
  devCompanyMembers: {
    name: string
    position: string
    email: string
  }[]
  systemManager: string
}
