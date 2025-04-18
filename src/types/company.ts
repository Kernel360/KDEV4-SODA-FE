export interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
  ceoPhone?: string
  registrationNumber?: string
  addressDetail?: string
}

export interface CompanyMember {
  id: number
  name: string
  position?: string
  phoneNumber?: string
  email?: string
}
