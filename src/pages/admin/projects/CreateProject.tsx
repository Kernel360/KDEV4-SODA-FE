import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CreateProjectSteps from '../../../components/projects/CreateProjectSteps'
import { useToast } from '../../../contexts/ToastContext'
import { companyService } from '../../../services/companyService'
import { projectService } from '../../../services/projectService'
import type { Company } from '../../../types'
import type { ProjectFormData } from '../../../components/projects/CreateProjectSteps'

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyService.getAllCompanies()
        setCompanies(data)
      } catch (error) {
        console.error('회사 목록 조회 중 오류:', error)
        showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
      }
    }

    fetchCompanies()
  }, [showToast])

  const handleSubmit = async (formData: ProjectFormData) => {
    try {
      const request = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        clientCompanyIds: formData.clientCompanies.map(cc => cc.id),
        devCompanyId: formData.devCompanyId,
        devManagers: formData.devMembers.filter(m => m.role === '담당자').map(m => m.id),
        devMembers: formData.devMembers.filter(m => m.role === '일반').map(m => m.id),
        clientManagers: formData.clientCompanies.flatMap(cc => 
          cc.responsibles.map(m => m.id)
        ),
        clientMembers: formData.clientCompanies.flatMap(cc => 
          cc.members.map(m => m.id)
        )
      }

      await projectService.createProject(request)
      showToast('프로젝트가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/projects')
    } catch (error) {
      console.error('프로젝트 생성 중 오류:', error)
      showToast('프로젝트 생성 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleCancel = () => {
    navigate('/admin/projects')
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <CreateProjectSteps
        companies={companies}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Box>
  )
}

export default CreateProject
