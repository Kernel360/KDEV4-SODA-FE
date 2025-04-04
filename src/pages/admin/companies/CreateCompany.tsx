import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CompanyForm from '../../../components/common/CompanyForm'
import { useToast } from '../../../contexts/ToastContext'
import type { Company } from '../../../types/company'

const CreateCompany: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (data: Omit<Company, 'id'>) => {
    try {
      // TODO: API 호출로 대체
      showToast('회사가 생성되었습니다.', 'success')
      navigate('/admin/companies')
    } catch (err) {
      showToast('회사 생성에 실패했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom>
          회사 생성
        </Typography>
        <CompanyForm onSubmit={handleSubmit} />
      </Paper>
    </Box>
  )
}

export default CreateCompany
