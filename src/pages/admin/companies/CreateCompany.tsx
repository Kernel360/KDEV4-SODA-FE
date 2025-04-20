import React from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CompanyForm, { CompanyFormData } from '../../../components/common/CompanyForm'
import { useToast } from '../../../contexts/ToastContext'
import { companyService } from '../../../services/companyService'

const CreateCompany: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (formData: CompanyFormData) => {
    try {
      await companyService.createCompany({
        name: formData.name,
        ceoName: formData.ceoName,
        phoneNumber: formData.phoneNumber,
        businessNumber: formData.businessNumber,
        address: formData.address,
        isActive: formData.isActive
      })
      showToast('회사가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/companies')
    } catch (error) {
      console.error('회사 생성 중 오류:', error)
      showToast('회사 생성 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        회사 생성
      </Typography>
      <CompanyForm onSubmit={handleSubmit} />
    </Box>
  )
}

export default CreateCompany
