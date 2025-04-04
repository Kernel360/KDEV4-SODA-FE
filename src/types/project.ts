export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  projectNumber: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  clientCompany: string
  developmentCompany: string
  clientManagers: ProjectParticipant[]
  clientParticipants: ProjectParticipant[]
  developmentManagers: ProjectParticipant[]
  developmentParticipants: ProjectParticipant[]
  systemManager: string
  managers: ProjectParticipant[]
  participants: ProjectParticipant[]
}
