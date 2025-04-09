import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import CompanyForm from '../../../components/common/CompanyForm'
import type { Company } from '../../../types/company'
import { useToast } from '../../../contexts/ToastContext'

const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        // TODO: API 호출로 대체
        const dummyCompany: Company = {
          id: Number(id),
          name: '테스트 회사',
          ceoName: '홍길동',
          ceoPhone: '010-1234-5678',
          registrationNumber: '123-45-67890',
          address: '서울특별시 강남구 테헤란로 123',
          addressDetail: '4층 401호'
        }
        setCompany(dummyCompany)
      } catch (err) {
        showToast('회사 정보를 불러오는데 실패했습니다.', 'error')
        navigate('/admin/companies')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id, navigate, showToast])

  const handleSubmit = async () =>
    //data: Omit<Company, 'id'>
    {
      try {
        // TODO: API 호출로 대체
        showToast('회사 정보가 수정되었습니다.', 'success')
        navigate(`/admin/companies/${id}`)
      } catch (err) {
        showToast('회사 정보 수정에 실패했습니다.', 'error')
      }
    }

  if (loading) return <div>Loading...</div>
  if (!company) return <div>회사를 찾을 수 없습니다.</div>

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom>
          {company.name}
        </Typography>
        <CompanyForm
          initialData={company}
          onSubmit={handleSubmit}
        />
      </Paper>
    </Box>
  )
}

export default EditCompany
