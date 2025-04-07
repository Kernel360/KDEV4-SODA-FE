import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import CreateAccountForm from '@/components/accounts/CreateAccountForm'
import { getCompanyList } from '../../../api/company'
import { signup } from '../../../api/auth'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList()
      if (response.status === 'success') {
        setCompanies(response.data)
      } else {
        showToast(response.message || '회사 목록을 불러오는데 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

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

      // API 호출
      const response = await signup({
        name: formData.name,
        authId: formData.username,
        password: formData.password,
        role: formData.isAdmin ? 'ADMIN' : 'USER',
        companyId: parseInt(formData.companyId)
      })

      if (response.status === 'success') {
        setSuccess('계정이 성공적으로 생성되었습니다.')
        setTimeout(() => {
          navigate('/admin/accounts')
        }, 1000)
      } else {
        setError(response.message || '계정 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('계정 생성 중 오류:', err)
      setError('계정 생성 중 오류가 발생했습니다.')
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
        gutterBottom>
        계정 생성
      </Typography>
      <CreateAccountForm
        loading={loading}
        error={error}
        success={success}
        companies={companies}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Box>
  )
}
