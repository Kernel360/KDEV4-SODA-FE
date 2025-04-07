export interface Company {
  id: number
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailAddress: string
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