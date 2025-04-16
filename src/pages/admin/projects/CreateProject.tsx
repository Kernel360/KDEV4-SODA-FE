import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { getCompanyList } from '../../../api/company'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'
import { projectService } from '../../../services/projectService'
import CreateProjectForm from '../../../components/projects/CreateProjectForm'
import axios from 'axios'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

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
      if (response.status === 'success' && Array.isArray(response.data)) {
        setCompanies(response.data)
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
    setLoading(true)
    setError(null)
    setSuccess(null)

    // 회사 ID를 숫자로 변환
    const clientCompanyId = parseInt(formData.clientCompanyId)
    const developmentCompanyId = parseInt(formData.developmentCompanyId)

    // 담당자 ID들을 숫자 배열로 변환
    const clientManagers = formData.clientManagers.map(id => parseInt(id))
    const developmentManagers = formData.developmentManagers.map(id =>
      parseInt(id)
    )
    const clientParticipants = formData.clientParticipants.map(id =>
      parseInt(id)
    )
    const developmentParticipants = formData.developmentParticipants.map(id =>
      parseInt(id)
    )

    // 날짜 형식을 ISO 문자열로 변환
    const startDate = new Date(formData.startDate).toISOString()
    const endDate = new Date(formData.endDate).toISOString()

    const requestData = {
      title: formData.name,
      description: formData.description || '',
      status: 'CONTRACT',
      startDate: startDate,
      endDate: endDate,
      clientCompanyId: clientCompanyId,
      devCompanyId: developmentCompanyId,
      devManagers: developmentManagers,
      devMembers: developmentParticipants || [],
      clientManagers: clientManagers,
      clientMembers: clientParticipants || []
    }

    try {
      console.log('Sending request data:', requestData)
      const response = await projectService.createProject(requestData)

      if (response) {
        setSuccess('프로젝트가 성공적으로 생성되었습니다.')
        showToast('프로젝트가 성공적으로 생성되었습니다.', 'success')
        setTimeout(() => {
          navigate('/admin/projects')
        }, 1500)
      }
    } catch (err) {
      console.error('프로젝트 생성 중 오류:', err)
      if (axios.isAxiosError(err)) {
        console.error('API 응답:', err.response?.data)
        console.error('상태 코드:', err.response?.status)
        console.error('요청 데이터:', requestData)
      }
      setError('프로젝트 생성 중 오류가 발생했습니다.')
      showToast('프로젝트 생성 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/projects')
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
    </LocalizationProvider>
  )
}
