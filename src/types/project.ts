export interface ProjectParticipant {
  id: number
  name: string
  role?: string
}

export interface Project {
  id: number
  projectNumber: string
  title: string
  description: string
  status: '대기중' | '진행중' | '완료' | '중단'
  startDate: string
  endDate: string
  clientCompanyName: string
  devCompanyName: string
  systemManager: string
  clientManagers: ProjectParticipant[]
  clientParticipants: ProjectParticipant[]
  developmentManagers: ProjectParticipant[]
  developmentParticipants: ProjectParticipant[]
  managers: ProjectParticipant[]
  participants: ProjectParticipant[]
  createdAt: string
  updatedAt: string
}
