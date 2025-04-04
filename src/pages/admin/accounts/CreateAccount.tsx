import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import CreateAccountForm from '@/components/accounts/CreateAccountForm'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 계정 생성 핸들러
  const handleSave = async (formData: {
    name: string
    username: string
    password: string
    confirmPassword: string
    isAdmin: boolean
    companyId: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // 비밀번호 확인
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }

      // 회사 선택 확인
      if (!formData.companyId) {
        setError('회사를 선택해주세요.')
        return
      }

      // 실제로는 API 호출을 통해 계정을 생성해야 함
      console.log('생성할 계정 데이터:', formData)

      // 성공 메시지 표시
      setSuccess('계정이 성공적으로 생성되었습니다.')

      // 1초 후 계정 목록 페이지로 이동
      setTimeout(() => {
        navigate('/admin/accounts')
      }, 1000)
    } catch (err) {
      setError('계정 생성 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/admin/accounts')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        component="h1"
        sx={{ mb: 3 }}>
        계정 생성
      </Typography>

      <CreateAccountForm
        loading={loading}
        error={error}
        success={success}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Box>
  )
}
