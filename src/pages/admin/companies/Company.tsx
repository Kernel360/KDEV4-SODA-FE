import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompanyDetail from '../../../components/company/CompanyDetail'
import type { Company } from '../../../types/company'
import { useToast } from '../../../contexts/ToastContext'

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
        // TODO: API 호출로 대체
        const dummyCompany: Company = {
          id: Number(id),
          name: '테스트 회사',
          ceoName: '홍길동',
          ceoPhone: '010-1234-5678',
          registrationNumber: '123-45-67890',
          address: '서울특별시 강남구 테헤란로 123',
          addressDetail: '4층 401호',
          phoneNumber: '',
          businessNumber: '',
          isActive: false
        }
        setCompany(dummyCompany)
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
        // TODO: API 호출로 대체
        showToast('회사가 삭제되었습니다.', 'success')
        navigate('/admin/companies')
      } catch (err) {
        showToast('회사 삭제에 실패했습니다.', 'error')
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!company) return <div>회사를 찾을 수 없습니다.</div>

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
