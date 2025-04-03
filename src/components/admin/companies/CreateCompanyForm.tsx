import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material'

interface Company {
  id: string
  name: string
  representativeName: string
  representativePhone: string
  businessNumber: string
  address: string
  detailAddress: string
}

export default function CreateCompanyForm() {
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company>({
    id: '',
    name: '',
    representativeName: '',
    representativePhone: '',
    businessNumber: '',
    address: '',
    detailAddress: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompany(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // 필수 필드 검증
    if (
      !company.name ||
      !company.representativeName ||
      !company.representativePhone ||
      !company.businessNumber ||
      !company.address
    ) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    try {
      // API 호출 로직 추가 예정
      console.log('회사 생성:', company)
      setSuccess('회사가 성공적으로 생성되었습니다.')
      setTimeout(() => {
        navigate('/admin/companies')
      }, 2000)
    } catch (err) {
      console.error('회사 생성 중 오류 발생:', err)
      setError('회사 생성 중 오류가 발생했습니다.')
    }
  }

  const handleCancel = () => {
    navigate('/admin/companies')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper
        elevation={3}
        sx={{ p: 4 }}>
        <Typography
          variant="h5"
          component="h1"
          gutterBottom>
          회사 등록
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          label="회사명"
          name="name"
          value={company.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="대표자명"
          name="representativeName"
          value={company.representativeName}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="대표자 연락처"
          name="representativePhone"
          value={company.representativePhone}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="사업자등록번호"
          name="businessNumber"
          value={company.businessNumber}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="주소"
          name="address"
          value={company.address}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="상세 주소"
          name="detailAddress"
          value={company.detailAddress}
          onChange={handleChange}
          margin="normal"
          placeholder="상세 주소를 입력해주세요"
        />

        <Box
          sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained">
            저장
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
