import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import CreateProjectForm from '@/components/projects/CreateProjectForm'
import { getCompanyList } from '../../../api/company'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'
import { projectService } from '@/services/projectService'

export default function CreateProject() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList()
      if (response.status === 'success') {
        setCompanies(response.data || [])
      } else {
        showToast(
          response.message || '회사 목록을 불러오는데 실패했습니다.',
          'error'
        )
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  // 프로젝트 생성 핸들러
  const handleSave = async (formData: {
    name: string
    description: string
    startDate: string
    endDate: string
    clientCompanyId: string
    developmentCompanyId: string
    clientManagers: string[]
    clientParticipants: string[]
    developmentManagers: string[]
    developmentParticipants: string[]
  }) => {
    try {
      setLoading(true)
      setError(null)

      // 회사 선택 확인
      if (!formData.clientCompanyId || !formData.developmentCompanyId) {
        setError('고객사와 개발사를 모두 선택해주세요.')
        return
      }

      // API 호출을 통해 프로젝트 생성
      const response = await projectService.createProject({
        title: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        clientCompanyId: Number(formData.clientCompanyId),
        devCompanyId: Number(formData.developmentCompanyId),
        devManagers: formData.developmentManagers.map(Number),
        devMembers: formData.developmentParticipants.map(Number),
        clientManagers: formData.clientManagers.map(Number),
        clientMembers: formData.clientParticipants.map(Number)
      })

      // 성공 메시지 표시
      setSuccess('프로젝트가 성공적으로 생성되었습니다.')

      // 1초 후 프로젝트 목록 페이지로 이동
      setTimeout(() => {
        navigate('/admin/projects')
      }, 1000)
    } catch (err) {
      console.error('프로젝트 생성 중 오류:', err)
      setError('프로젝트 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/admin/projects')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom>
        프로젝트 생성
      </Typography>
      <CreateProjectForm
        loading={loading}
        error={error}
        success={success}
        companies={companies}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Box>
  )
}
