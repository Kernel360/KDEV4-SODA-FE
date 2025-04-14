export interface Company {
  id: number
  name: string
  businessNumber: string
  address: string
  type: string
}

export interface User {
  name: string
  authId: string
  position: string
  phoneNumber: string
  role: string
  firstLogin: boolean
  email?: string
  company?: Company
} 