export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  name: string
  description: string
  projectNumber: string
  status: string
  startDate: string
  endDate: string
  clientCompany: string
  clientManagers: {
    name: string
    position: string
    email: string
  }[]
  clientParticipants: {
    name: string
    position: string
    email: string
  }[]
  developmentCompany: string
  developmentManagers: {
    name: string
    position: string
    email: string
  }[]
  developmentParticipants: {
    name: string
    position: string
    email: string
  }[]
  systemManager: string
}
