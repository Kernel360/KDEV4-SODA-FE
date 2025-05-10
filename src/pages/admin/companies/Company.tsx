import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompanyDetail from '../../../components/company/CompanyDetail'
import type { Company } from '../../../types/company'
import { useToast } from '../../../contexts/ToastContext'
import { companyService } from '../../../services/companyService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!id) return
        const data = await companyService.getCompanyById(Number(id))
        setCompany(data)
      } catch (err) {
        setError('회사 정보를 불러오는데 실패했습니다.')
        showToast('회사 정보를 불러오는데 실패했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id, showToast])

  const handleEdit = () => {
    navigate(`/admin/companies/${id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('정말로 이 회사를 삭제하시겠습니까?')) {
      try {
        if (!id) return
        await companyService.deleteCompany(Number(id))
        showToast('회사가 삭제되었습니다.', 'success')
        navigate('/admin/companies')
      } catch (err) {
        showToast('회사 삭제에 실패했습니다.', 'error')
      }
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!company) return <ErrorMessage message="회사를 찾을 수 없습니다." />

  return (
    <CompanyDetail
      company={company}
      isEditable={true}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

export default CompanyPage
