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
  InputLabel,
  SelectChangeEvent
} from '@mui/material'
import { Save, X } from 'lucide-react'
import type { CompanyListItem } from '../../types/api'

interface CreateAccountFormProps {
  loading: boolean
  error: string | null
  success: string | null
  companies: CompanyListItem[]
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

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  loading,
  error,
  success,
  companies,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    companyId: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isAdmin' ? checked : value
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

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

          <FormControl fullWidth>
            <InputLabel>회사</InputLabel>
            <Select
              name="companyId"
              value={formData.companyId}
              onChange={handleSelectChange}
              required>
              {companies.map(company => (
                <MenuItem
                  key={company.id}
                  value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <RadioGroup
              name="isAdmin"
              value={formData.isAdmin}
              onChange={handleChange}>
              <FormControlLabel
                value={false}
                control={<Radio />}
                label="일반 사용자"
              />
              <FormControlLabel
                value={true}
                control={<Radio />}
                label="관리자"
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<X />}
              onClick={onCancel}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}>
              저장
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  )
}

export default CreateAccountForm
