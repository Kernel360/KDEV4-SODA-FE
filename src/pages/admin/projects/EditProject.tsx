import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import { mockProjects, mockCompanies, mockMembers } from '../../../api/mockData'

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // 실제로는 API를 호출하여 프로젝트를 가져옵니다
        const foundProject = mockProjects.find(p => p.id === Number(id))
        if (!foundProject) {
          throw new Error('프로젝트를 찾을 수 없습니다.')
        }
        setProject(foundProject)
      } catch (error) {
        showToast('프로젝트를 불러오는 중 오류가 발생했습니다.', 'error')
        navigate('/admin/projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, navigate, showToast])

  const handleSubmit = async (formData: any) => {
    try {
      // ProjectFormData를 Project 타입으로 변환
      const projectData: Project = {
        id: Number(id),
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate?.format('YYYY-MM-DD') || '',
        endDate: formData.endDate?.format('YYYY-MM-DD') || '',
        members: mockMembers.filter(member => formData.members.includes(member.id)),
        companies: mockCompanies.filter(company => formData.companies.includes(company.id))
      }

      // 실제로는 API를 호출하여 프로젝트를 수정합니다
      console.log('Updated project:', projectData)
      showToast('프로젝트가 성공적으로 수정되었습니다.', 'success')
      navigate('/admin/projects')
    } catch (error) {
      showToast('프로젝트 수정 중 오류가 발생했습니다.', 'error')
    }
  }

  if (loading) {
    return <Typography>로딩 중...</Typography>
  }

  if (!project) {
    return <Typography>프로젝트를 찾을 수 없습니다.</Typography>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          프로젝트 수정
        </Typography>
        <ProjectForm
          companies={mockCompanies}
          members={mockMembers}
          onSubmit={handleSubmit}
          isEdit={true}
          initialData={project}
        />
      </Paper>
    </Box>
  )
}

export default EditProject
