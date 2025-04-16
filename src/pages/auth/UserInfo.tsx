import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUserInfo } from '../../api/auth'
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
  Alert
} from '@mui/material'

const steps = ['회사 정보', '개인 정보', '계정 정보']

const UserInfo: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser } = useUserStore()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    position: '',
    name: '',
    email: '',
    phoneNumber: '',
    authId: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.position
      case 1:
        return !!formData.name && !!formData.email && !!formData.phoneNumber
      case 2:
        return !!formData.authId && !!formData.password && !!formData.confirmPassword
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
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))

        // 로컬 스토리지에서 role 값을 가져와서 리다이렉션
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          const userRole = parsedUser.role?.toUpperCase()
          if (userRole === 'ADMIN') {
            navigate('/admin')
          } else if (userRole === 'USER') {
            navigate('/user')
          } else {
            setError('유효하지 않은 사용자 역할입니다.')
          }
        } else {
          setError('사용자 정보를 찾을 수 없습니다.')
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
              required
              error={!formData.position && error !== ''}
              helperText={!formData.position && error !== '' ? '직책을 입력해주세요.' : ''}
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
              required
              error={!formData.name && error !== ''}
              helperText={!formData.name && error !== '' ? '이름을 입력해주세요.' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="이메일"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!formData.email && error !== ''}
              helperText={!formData.email && error !== '' ? '이메일을 입력해주세요.' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="전화번호"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              error={!formData.phoneNumber && error !== ''}
              helperText={!formData.phoneNumber && error !== '' ? '전화번호를 입력해주세요.' : ''}
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
              required
              error={!formData.authId && error !== ''}
              helperText={!formData.authId && error !== '' ? '아이디를 입력해주세요.' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!formData.password && error !== ''}
              helperText={!formData.password && error !== '' ? '비밀번호를 입력해주세요.' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={!formData.confirmPassword && error !== ''}
              helperText={!formData.confirmPassword && error !== '' ? '비밀번호 확인을 입력해주세요.' : ''}
            />
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
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
