export interface Company {
  id: number
  name: string
  phoneNumber: string
  companyNumber: string
  ownerName: string
  address: string
  detailAddress: string
}

export interface Member {
  id: number
  name: string
  authId: string
  email: string
  role: string
  company: Company
}

export interface Project {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  members: Member[]
  companies: Company[]
}

export interface Stage {
  id: number
  name: string
  order: number
  project: Project
}

export interface Task {
  id: number
  title: string
  description: string
  order: number
  stage: Stage
}

export interface User {
  name: string
  authId: string
  position: string
  phoneNumber: string
  role: 'USER' | 'ADMIN'
  firstLogin: boolean
  company: Company
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code: string;
  message: string;
  data?: T;
}

export interface LoginResponse {
  name: string
  authId: string
  position: string
  phoneNumber: string
  role: 'USER' | 'ADMIN'
  firstLogin: boolean
  company: Company
}

export interface LoginRequest {
  authId: string
  password: string
}

export interface FindIdRequest {
  name: string;
  email: string;
}

export interface FindIdResponse {
  maskedAuthId: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface CompanyCreateRequest {
  name: string
  phoneNumber: string
  ownerName: string
  companyNumber: string
  address: string
  detailAddress: string
} 