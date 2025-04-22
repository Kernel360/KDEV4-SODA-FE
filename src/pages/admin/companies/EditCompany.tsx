import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import CompanyForm from '../../../components/common/CompanyForm'
import { companyService } from '../../../services/companyService'
import { useToast } from '../../../contexts/ToastContext'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { CompanyFormData } from '../../../types/company'

const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyFormData | null>(null)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!id) return
        const data = await companyService.getCompanyById(Number(id))
        setCompany({
          name: data.name,
          phoneNumber: data.phoneNumber || '',
          companyNumber: data.companyNumber || '',
          address: data.address || '',
          detailaddress: data.detailAddress || '',
          ownerName: data.ceoName || ''
        })
      } catch (error) {
        console.error('회사 정보 조회 중 오류:', error)
        setError('회사 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id])

  const handleSubmit = async (formData: CompanyFormData) => {
    try {
      if (!id) return
      await companyService.updateCompany(Number(id), {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        companyNumber: formData.companyNumber,
        address: formData.address,
        detailaddress: formData.detailaddress
      })
      showToast('회사 정보가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/companies/${id}`)
    } catch (error) {
      console.error('회사 수정 중 오류:', error)
      showToast('회사 수정 중 오류가 발생했습니다.', 'error')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!company) return <ErrorMessage message="회사 정보를 찾을 수 없습니다." />

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        회사 정보 수정
      </Typography>
      <CompanyForm initialData={company} onSubmit={handleSubmit} />
    </Box>
  )
}

export default EditCompany
