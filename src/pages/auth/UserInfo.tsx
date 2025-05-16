import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUserInfo, login } from '../../api/auth'
import { useUserStore } from '../../stores/userStore'
import type { User } from '../../types/api'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Check, Refresh } from '@mui/icons-material'
import { client } from '../../api/client'

const steps = ['회사 정보', '개인 정보', '계정 정보']

const PHONE_NUMBER_REGEX = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/

const UserInfo: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser } = useUserStore()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingId, setIsCheckingId] = useState(false)
  const [idError, setIdError] = useState('')
  const [idVerified, setIdVerified] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({
    name: false,
    email: false,
    phoneNumber: false,
    authId: false,
    password: false,
    confirmPassword: false,
    position: false
  })

  const [formData, setFormData] = useState({
    position: '',
    name: '',
    email: '',
    phoneNumber: '',
    authId: '',
    password: '',
    confirmPassword: ''
  })

  const validateName = (name: string): string => {
    if (!name) return '이름은 필수입니다.'
    if (name.length < 2 || name.length > 20) return '이름은 2자 이상 20자 이하여야 합니다.'
    return ''
  }

  const validateEmail = (email: string): string => {
    if (!email) return '이메일은 필수입니다.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return '유효한 이메일 형식이 아닙니다.'
    return ''
  }

  const validatePhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '전화번호는 필수입니다.'
    if (!PHONE_NUMBER_REGEX.test(phoneNumber)) return '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
    return ''
  }

  const validateAuthId = (authId: string): string => {
    if (!authId) return '아이디는 필수입니다.'
    if (authId.length < 4 || authId.length > 20) return '아이디는 4자 이상 20자 이하여야 합니다.'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return '비밀번호는 필수입니다.'
    if (password.length < 8 || password.length > 20) return '비밀번호는 8자 이상 20자 이하여야 합니다.'
    return ''
  }

  const validatePosition = (position: string): string => {
    if (position && position.length > 50) return '직책은 50자를 초과할 수 없습니다.'
    return ''
  }

  const checkId = async () => {
    const id = formData.authId
    const idError = validateAuthId(id)
    if (idError) {
      setIdError(idError)
      return
    }

    // 현재 사용자의 아이디와 동일한 경우
    if (user?.authId === id) {
      setIdVerified(true)
      setIdError('')
      return
    }

    setIsCheckingId(true)
    setIdError('')
    setIdVerified(false)
    
    try {
      const response = await client.get(`/check-id?authId=${id}`)
      if (response.data.data === false) {
        setIdError('이미 사용 중인 아이디입니다.')
      } else {
        setIdVerified(true)
        setIdError('')
      }
    } catch (error) {
      setIdError('아이디 확인 중 오류가 발생했습니다.')
    } finally {
      setIsCheckingId(false)
    }
  }

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === 'phoneNumber') {
      processedValue = formatPhoneNumber(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))

    // 입력값이 변경되면 검증 상태 초기화
    if (name === 'authId') {
      setIdVerified(false)
      if (touched.authId) {
        setIdError(validateAuthId(processedValue))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const shouldShowError = (fieldName: string, value: string): boolean => {
    return touched[fieldName] && !!validateField(fieldName, value)
  }

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'name':
        return validateName(value)
      case 'email':
        return validateEmail(value)
      case 'phoneNumber':
        return validatePhoneNumber(value)
      case 'authId':
        return validateAuthId(value)
      case 'password':
        return validatePassword(value)
      case 'confirmPassword':
        return formData.password !== value ? '비밀번호가 일치하지 않습니다.' : ''
      case 'position':
        return validatePosition(value)
      default:
        return ''
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !validatePosition(formData.position)
      case 1:
        return !validateName(formData.name) && 
               !validateEmail(formData.email) && 
               !validatePhoneNumber(formData.phoneNumber)
      case 2:
        return !validateAuthId(formData.authId) && 
               !validatePassword(formData.password) && 
               formData.password === formData.confirmPassword &&
               idVerified
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      setError('모든 필드를 입력해주세요.')
      return
    }
    setError('')
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 1. 사용자 정보 업데이트
      const response = await updateUserInfo({
        memberId: (user as User)?.memberId || 0,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        authId: formData.authId,
        password: formData.password,
        position: formData.position
      })

      if (response?.status === 'success') {
        // 2. 새로운 authId로 로그인하여 토큰 재발급
        const loginResponse = await login({
          authId: formData.authId,
          password: formData.password
        })

        if (loginResponse.status === 'success' && loginResponse.data) {
          // 3. 새로운 토큰과 사용자 정보 저장
          localStorage.setItem('token', loginResponse.data.token)
          
          const updatedUser: User = {
            ...(user as User),
            id: (user as User)?.id || 0,
            memberId: (user as User)?.memberId || 0,
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            position: formData.position,
            role: (user as User)?.role || 'USER',
            firstLogin: false,
            company: user?.company
          }
          
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)

          // 4. role에 따른 리다이렉션
          const userRole = updatedUser.role?.toUpperCase()
          if (userRole === 'ADMIN') {
            navigate('/admin')
          } else if (userRole === 'USER') {
            navigate('/user')
          } else {
            setError('유효하지 않은 사용자 역할입니다.')
          }
        } else {
          setError('로그인 재시도 중 오류가 발생했습니다.')
        }
      } else {
        setError(response?.message || '정보 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('정보 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="회사명"
              value={user?.company?.name || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="직책"
              name="position"
              value={formData.position}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('position', formData.position)}
              helperText={shouldShowError('position', formData.position) ? validatePosition(formData.position) : ''}
              inputProps={{ maxLength: 50 }}
            />
          </Box>
        )
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('name', formData.name)}
              helperText={shouldShowError('name', formData.name) ? validateName(formData.name) : ''}
              inputProps={{ minLength: 2, maxLength: 20 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="이메일"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('email', formData.email)}
              helperText={shouldShowError('email', formData.email) ? validateEmail(formData.email) : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="전화번호"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('phoneNumber', formData.phoneNumber)}
              helperText={shouldShowError('phoneNumber', formData.phoneNumber) 
                ? validatePhoneNumber(formData.phoneNumber) 
                : '예: 010-1234-5678'}
              placeholder="010-1234-5678"
            />
          </Box>
        )
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="아이디"
              name="authId"
              value={formData.authId}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('authId', formData.authId) || !!idError}
              helperText={idError || (shouldShowError('authId', formData.authId) ? validateAuthId(formData.authId) : '')}
              inputProps={{ minLength: 4, maxLength: 20 }}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isCheckingId ? (
                      <CircularProgress size={20} />
                    ) : idVerified ? (
                      <Check color="success" />
                    ) : (
                      <IconButton
                        onClick={checkId}
                        edge="end"
                        disabled={!!validateAuthId(formData.authId)}>
                        <Refresh />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('password', formData.password)}
              helperText={shouldShowError('password', formData.password) ? validatePassword(formData.password) : ''}
              inputProps={{ minLength: 8, maxLength: 20 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={shouldShowError('confirmPassword', formData.confirmPassword)}
              helperText={shouldShowError('confirmPassword', formData.confirmPassword) 
                ? (formData.password !== formData.confirmPassword ? '비밀번호가 일치하지 않습니다.' : '') 
                : ''}
            />
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ 
      maxWidth: 600, 
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper sx={{ p: 3, width: '100%' }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, textAlign: 'center' }}>
          회원 정보 설정
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}>
            이전
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}>
              다음
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default UserInfo
