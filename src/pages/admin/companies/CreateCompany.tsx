import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid
} from '@mui/material'
import { useToast } from '../../../contexts/ToastContext'
import { createCompany } from '../../../api/company'
import { CompanyCreateRequest } from '../../../types/api'
import axios from 'axios'

const CreateCompany: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<CompanyCreateRequest>({
    name: '',
    phoneNumber: '',
    ownerName: '',
    companyNumber: '',
    address: '',
    detailAddress: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Submitting form data:', formData)
      const accessToken = localStorage.getItem('accessToken')
      console.log('Current access token:', accessToken)
      
      await createCompany(formData)
      showToast('회사가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/companies')
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '회사 생성 중 오류가 발생했습니다.'
        showToast(errorMessage, 'error')
      } else {
        showToast('회사 생성 중 오류가 발생했습니다.', 'error')
      }
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          회사 생성
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="회사명"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="전화번호"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="대표자명"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="사업자등록번호"
                name="companyNumber"
                value={formData.companyNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="주소"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="상세주소"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/companies')}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  생성
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateCompany
