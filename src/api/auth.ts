import { API_ENDPOINTS } from './config'
import { apiRequest } from './client'
import type { LoginRequest, LoginResponse, FindIdRequest, FindIdResponse, RequestPasswordResetRequest, VerifyCodeRequest, ResetPasswordRequest, SignupRequest, SignupResponse } from '../types/api'

export const login = async (data: LoginRequest) => {
  return apiRequest<LoginResponse>('POST', API_ENDPOINTS.LOGIN, data)
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