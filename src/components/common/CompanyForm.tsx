import { useState, useEffect } from 'react'
import { Box, Paper, TextField, Button, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CompanyFormData } from '../../types/company'

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void
  initialData?: CompanyFormData
}

const CompanyForm = ({ onSubmit, initialData }: CompanyFormProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    phoneNumber: '',
    companyNumber: '',
    address: '',
    detailaddress: '',
    ownerName: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        <Grid container spacing={3}>
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
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="연락처"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="사업자등록번호"
              name="companyNumber"
              value={formData.companyNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="주소"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="상세주소"
              name="detailaddress"
              value={formData.detailaddress}
              onChange={handleChange}
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
