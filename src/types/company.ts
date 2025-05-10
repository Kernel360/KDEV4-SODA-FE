export interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  ceoPhone?: string
  registrationNumber?: string
  addressDetail?: string
  companyNumber: string
  detailAddress: string | null
  ownerName: string
}

export interface CompanyMember {
  id: number
  name: string
  position?: string
  phoneNumber?: string
  email?: string
}

export interface CompanyFormData {
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailaddress: string
  ownerName: string
}
