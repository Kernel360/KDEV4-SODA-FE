import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import dayjs from 'dayjs'
import { projectService } from '../../../services/projectService'
import { getCompanyList, getCompanyMembers } from '../../../api/company'
import type { CompanyListItem, CompanyMember } from '../../../types/api'

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [project, setProject] = React.useState<Project | null>(null)
  const [companies, setCompanies] = React.useState<CompanyListItem[]>([])
  const [employees, setEmployees] = React.useState<CompanyMember[]>([])

  React.useEffect(() => {
    fetchProject()
    fetchCompanies()
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

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList()
      if (response.status === 'success' && Array.isArray(response.data)) {
        setCompanies(response.data)
        // 각 회사의 직원 정보를 가져옵니다
        const employeePromises = response.data.map(company =>
          getCompanyMembers(company.id)
        )
        const employeeResponses = await Promise.all(employeePromises)
        const allEmployees = employeeResponses.reduce<CompanyMember[]>(
          (acc, response) => {
            if (response.status === 'success' && Array.isArray(response.data)) {
              return [...acc, ...response.data]
            }
            return acc
          },
          []
        )
        setEmployees(allEmployees)
      }
    } catch (error) {
      console.error('회사 목록 조회 중 오류:', error)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (!id) return

      // ProjectFormData를 Project 타입으로 변환
      const projectData: Project = {
        id: Number(id),
        title: formData.name,
        description: formData.description,
        status: project?.status || '진행중',
        startDate: formData.startDate?.format('YYYY-MM-DD') || '',
        endDate: formData.endDate?.format('YYYY-MM-DD') || '',
        clientCompanyName: formData.clientCompanyId,
        devCompanyName: formData.developmentCompanyId,
        clientCompanyManagers: formData.clientManagers,
        clientCompanyMembers: formData.clientParticipants,
        devCompanyManagers: formData.developmentManagers,
        devCompanyMembers: formData.developmentParticipants
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
    name: project.title,
    description: project.description,
    startDate: project.startDate ? dayjs(project.startDate) : null,
    endDate: project.endDate ? dayjs(project.endDate) : null,
    clientCompanyId: project.clientCompanyName,
    developmentCompanyId: project.devCompanyName,
    clientManagers: project.clientCompanyManagers,
    clientParticipants: project.clientCompanyMembers,
    developmentManagers: project.devCompanyManagers,
    developmentParticipants: project.devCompanyMembers
  }

  // CompanyListItem을 Company 타입으로 변환
  const formattedCompanies = companies.map(company => ({
    id: company.id.toString(),
    name: company.name
  }))

  // CompanyMember를 Employee 타입으로 변환
  const formattedEmployees = employees.map(employee => ({
    id: employee.id.toString(),
    name: employee.name,
    companyId: employee.authId,
    position: employee.position || ''
  }))

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3 }}>
          {project.title}
        </Typography>
        <ProjectForm
          companies={formattedCompanies}
          employees={formattedEmployees}
          onSubmit={handleSubmit}
          initialData={initialFormData}
          isEdit={true}
        />
      </Paper>
    </Box>
  )
}

export default EditProject
