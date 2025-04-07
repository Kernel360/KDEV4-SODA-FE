import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import { mockCompanies, mockMembers } from '../../../api/mockData'

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (formData: any) => {
    try {
      // ProjectFormData를 Project 타입으로 변환
      const projectData: Project = {
        id: 0, // 새 프로젝트이므로 임시 ID
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate?.format('YYYY-MM-DD') || '',
        endDate: formData.endDate?.format('YYYY-MM-DD') || '',
        members: mockMembers.filter(member => formData.members.includes(member.id)),
        companies: mockCompanies.filter(company => formData.companies.includes(company.id))
      }

      // 실제로는 API를 호출하여 프로젝트를 생성합니다
      console.log('Created project:', projectData)
      showToast('프로젝트가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/projects')
    } catch (error) {
      showToast('프로젝트 생성 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          프로젝트 생성
        </Typography>
        <ProjectForm
          companies={mockCompanies}
          members={mockMembers}
          onSubmit={handleSubmit}
          isEdit={false}
        />
      </Paper>
    </Box>
  )
}

export default CreateProject
