import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CompanyForm from '../../../components/common/CompanyForm'
import { useToast } from '../../../contexts/ToastContext'
import { createCompany } from '../../../api/company'
import type { Company } from '../../../types/company'

const CreateCompany: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (data: Omit<Company, 'id'>) => {
    try {
      const response = await createCompany({
        name: data.name,
        phoneNumber: data.ceoPhone,
        ownerName: data.ceoName,
        companyNumber: data.registrationNumber,
        address: data.address,
        detailaddress: data.addressDetail,
      })

      if (response.status === 'success') {
        showToast('회사가 생성되었습니다.', 'success')
        navigate('/admin/companies')
      } else {
        showToast(response.message || '회사 생성에 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('회사 생성 중 오류:', err)
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
