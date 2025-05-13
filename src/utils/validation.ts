import { PasswordPolicy } from '../types/company'

interface ValidationResult {
  isValid: boolean
  message: string
}

export const validatePassword = (
  password: string,
  policy: PasswordPolicy
): ValidationResult => {
  if (password.length < policy.minLength) {
    return {
      isValid: false,
      message: `비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다.`
    }
  }

  if (policy.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: '비밀번호는 특수문자를 포함해야 합니다.'
    }
  }

  if (policy.requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      message: '비밀번호는 숫자를 포함해야 합니다.'
    }
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: '비밀번호는 대문자를 포함해야 합니다.'
    }
  }

  return {
    isValid: true,
    message: ''
  }
}
