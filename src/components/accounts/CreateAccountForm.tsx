import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import { Save, X } from 'lucide-react'

// 회사 인터페이스 정의
interface Company {
  id: string
  name: string
}

// 더미 회사 데이터
const dummyCompanies: Company[] = [
  { id: '1', name: '테크솔루션' },
  { id: '2', name: '클라우드시스템' },
  { id: '3', name: '디자인스튜디오' },
  { id: '4', name: '데이터인사이트' },
  { id: '5', name: '소프트웨어엔지니어링' }
]

interface CreateAccountFormProps {
  loading: boolean
  error: string | null
  success: string | null
  onSave: (formData: {
    name: string
    username: string
    password: string
    confirmPassword: string
    isAdmin: boolean
    companyId: string
  }) => Promise<void>
  onCancel: () => void
}

export default function CreateAccountForm({
  loading,
  error,
  success,
  onSave,
  onCancel
}: CreateAccountFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    companyId: ''
  })

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isAdmin' ? checked : value
    }))
  }

  // Select 컴포넌트 변경 핸들러
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <Paper sx={{ p: 3 }}>
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

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <FormControl
            fullWidth
            required>
            <InputLabel id="company-select-label">회사</InputLabel>
            <Select
              labelId="company-select-label"
              name="companyId"
              value={formData.companyId}
              label="회사"
              onChange={handleSelectChange}>
              {dummyCompanies.map(company => (
                <MenuItem
                  key={company.id}
                  value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <Typography
              variant="subtitle1"
              sx={{ mb: 1 }}>
              계정 유형
            </Typography>
            <RadioGroup
              name="isAdmin"
              value={formData.isAdmin}
              onChange={handleChange}>
              <FormControlLabel
                value={true}
                control={<Radio />}
                label="관리자"
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label="사용자"
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<X />}
              onClick={onCancel}
              disabled={loading}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}>
              {loading ? <CircularProgress size={24} /> : '저장'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  )
}
