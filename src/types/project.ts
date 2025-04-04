export interface ProjectParticipant {
  name: string
  position: string
  email: string
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
  clientManagers: ProjectParticipant[]
  clientParticipants: ProjectParticipant[]
  developmentCompany: string
  developmentManagers: ProjectParticipant[]
  developmentParticipants: ProjectParticipant[]
  systemManager: string
}
