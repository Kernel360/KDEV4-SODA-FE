import { useState } from 'react'
import { Box, Paper, TextField, Button, Grid, FormControlLabel, Switch } from '@mui/material'
import { useNavigate } from 'react-router-dom'
//import { Company } from '../../types/company'

export interface CompanyFormData {
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
}

interface CompanyFormProps {
  initialData?: CompanyFormData
  onSubmit: (data: CompanyFormData) => Promise<void>
}

const CompanyForm = ({ initialData, onSubmit }: CompanyFormProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>(
    initialData || {
      name: '',
      ceoName: '',
      phoneNumber: '',
      businessNumber: '',
      address: '',
      isActive: true
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="회사명"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="대표자명"
              name="ceoName"
              value={formData.ceoName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="연락처"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="사업자등록번호"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="주소"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                />
              }
              label="활성화 상태"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}>
                {initialData ? '수정 취소' : '생성 취소'}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                저장
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export default CompanyForm
