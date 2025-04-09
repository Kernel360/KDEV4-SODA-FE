export interface Company {
  id: number
  name: string
  ceoName: string
  ceoPhone: string
  registrationNumber: string
  address: string
  addressDetail: string
}

export interface CompanyMember {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
}
