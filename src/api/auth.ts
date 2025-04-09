import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type { LoginRequest, LoginResponse, FindIdRequest, FindIdResponse, RequestPasswordResetRequest, VerifyCodeRequest, ResetPasswordRequest, SignupRequest, SignupResponse, User } from '../types/api'
import { instance } from './config'

export const login = async (data: LoginRequest) => {
  const response = await instance.post<LoginResponse>(API_ENDPOINTS.LOGIN, data)
  const token = response.headers.authorization
  return {
    status: 'success',
    code: '200',
    message: 'OK',
    data: {
      ...response.data,
      token: token?.replace('Bearer ', '')
    }
  }
}

export async function findId(data: FindIdRequest) {
  return apiRequest<FindIdResponse>('POST', API_ENDPOINTS.FIND_ID, data)
}

export const requestPasswordReset = async (data: RequestPasswordResetRequest) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.FIND_PASSWORD, data);
    return response;
  } catch (error) {
    throw error;
  }
}

export const verifyCode = async (data: VerifyCodeRequest) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.VERIFY_CODE, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (data: ResetPasswordRequest) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.RESET_PASSWORD, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const signup = async (data: SignupRequest) => {
  return apiRequest<SignupResponse>('POST', API_ENDPOINTS.SIGNUP, data)
}

export const getUserInfo = () => {
  return instance.get<User>('/members/me')
}

export const updateProfile = (data: {
  name: string
  email: string
  phoneNumber: string
  position: string
}) => {
  return instance.put('/members/me', data)
}

export const updatePassword = (data: {
  currentPassword: string
  newPassword: string
}) => {
  return instance.put('/members/me/password', data)
} 