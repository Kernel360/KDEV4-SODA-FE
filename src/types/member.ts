export interface Member {
  id: number
  name: string
  email: string
  phoneNumber: string
  position?: string
  department?: string
  createdAt: string
  updatedAt: string
}

export interface Profile extends Member {
  profileImage?: string
  bio?: string
} 