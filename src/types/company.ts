export interface Company {
  id: number
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailAddress: string | null
  ownerName: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface CompanyMember {
  id: number
  name: string
  authId: string
  email: string | null
  position: string | null
  phoneNumber: string | null
  isDeleted: boolean
  companyId: number
  role: 'ADMIN' | 'USER'
}

export interface CompanyFormData {
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailAddress: string
  ownerName: string
}

export interface PasswordPolicy {
  minLength: number
  requireSpecialChar: boolean
  requireNumber: boolean
  requireUppercase: boolean
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireSpecialChar: true,
  requireNumber: true,
  requireUppercase: true
}
