import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CompanyForm from '../../../components/common/CompanyForm'
import { useToast } from '../../../contexts/ToastContext'
import { companyService } from '../../../services/companyService'
import { CompanyFormData } from '../../../types/company'

const CreateCompany: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      const companyData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        companyNumber: data.companyNumber,
        address: data.address,
        detailAddress: data.detailAddress,
        ownerName: data.ownerName
      }
      await companyService.createCompany(companyData)
      showToast('회사가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/companies')
    } catch (error) {
      console.error('회사 생성 중 오류:', error)
      showToast('회사 생성 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom>
        회사 등록
      </Typography>
      {error && (
        <Typography
          color="error"
          sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <CompanyForm onSubmit={handleSubmit} />
    </Box>
  )
}

export default CreateCompany
