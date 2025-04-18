import React from 'react'
import { Box, Paper } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import dayjs from 'dayjs'
import { projectService } from '../../../services/projectService'

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [project, setProject] = React.useState<Project | null>(null)

  React.useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      if (!id) return
      const response = await projectService.getProjectById(Number(id))
      setProject(response)
    } catch (error) {
      console.error('프로젝트 조회 중 오류:', error)
      showToast('프로젝트 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (!id) return

      // 기존 프로젝트 정보와 새로운 정보를 병합
      const projectData: Partial<Project> = {
        id: project?.id || 0,
        title: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        clientCompanyIds: project?.clientCompanyIds,
        devCompanyId: project?.devCompanyId,
        clientCompanyName: project?.clientCompanyName,
        devCompanyName: project?.devCompanyName,
        clientCompanyManagers: project?.clientCompanyManagers || [],
        clientCompanyMembers: project?.clientCompanyMembers || [],
        devCompanyManagers: project?.devCompanyManagers || [],
        devCompanyMembers: project?.devCompanyMembers || []
      }

      // API를 호출하여 프로젝트를 업데이트
      await projectService.updateProject(Number(id), projectData)
      showToast('프로젝트가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/projects/${id}`)
    } catch (error) {
      console.error('프로젝트 수정 중 오류:', error)
      showToast('프로젝트 수정 중 오류가 발생했습니다.', 'error')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!project) {
    return <div>Project not found</div>
  }

  // ProjectFormData 형식으로 변환
  const initialFormData = {
    name: project?.title || '',
    description: project?.description || '',
    startDate: project?.startDate ? dayjs(project.startDate) : null,
    endDate: project?.endDate ? dayjs(project.endDate) : null
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <ProjectForm
          onSubmit={handleSubmit}
          initialData={initialFormData}
          isEdit={true}
        />
      </Paper>
    </Box>
  )
}

export default EditProject
