import React from 'react'
import { Box, Paper } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import dayjs from 'dayjs'
import { projectService } from '../../../services/projectService'
import { getCompanyList, getCompanyMembers } from '../../../api/company'
import type { CompanyListItem } from '../../../types/api'

enum ProjectStatus {
  CONTRACT = 'CONTRACT',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  MAINTENANCE = 'MAINTENANCE',
  ON_HOLD = 'ON_HOLD'
}

interface Employee {
  id: string
  name: string
  companyId: string
  position: string
}

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [project, setProject] = React.useState<Project | null>(null)
  const [companies, setCompanies] = React.useState<CompanyListItem[]>([])
  const [clientEmployees, setClientEmployees] = React.useState<Employee[]>([])
  const [devEmployees, setDevEmployees] = React.useState<Employee[]>([])
  const [selectedClientCompany, setSelectedClientCompany] =
    React.useState<CompanyListItem | null>(null)
  const [selectedDevCompany, setSelectedDevCompany] =
    React.useState<CompanyListItem | null>(null)

  React.useEffect(() => {
    fetchProject()
    fetchCompanies()
  }, [id])

  React.useEffect(() => {
    if (project && companies.length > 0) {
      const clientCompany = companies.find(
        c => c.name === project.clientCompanyName
      )
      const devCompany = companies.find(c => c.name === project.devCompanyName)

      console.log('Found Client Company:', clientCompany)
      console.log('Found Dev Company:', devCompany)

      setSelectedClientCompany(clientCompany || null)
      setSelectedDevCompany(devCompany || null)

      // 고객사와 개발사의 직원 목록을 한 번에 가져옴
      if (clientCompany) {
        fetchCompanyEmployees(clientCompany.id, 'client')
      }
      if (devCompany) {
        fetchCompanyEmployees(devCompany.id, 'dev')
      }
    }
  }, [project, companies])

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
      }
    } catch (error) {
      console.error('회사 목록 조회 중 오류:', error)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  const fetchCompanyEmployees = async (
    companyId: number,
    type: 'client' | 'dev'
  ) => {
    try {
      const response = await getCompanyMembers(companyId)
      console.log(`Employees for ${type} company ${companyId}:`, response)
      if (response.status === 'success' && Array.isArray(response.data)) {
        const updatedEmployees = response.data.map(employee => ({
          id: String(employee.id),
          name: employee.name,
          companyId: String(companyId),
          position: employee.position || ''
        }))

        if (type === 'client') {
          setClientEmployees(updatedEmployees)
        } else {
          setDevEmployees(updatedEmployees)
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      showToast('직원 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (!id) return

      console.log('Form Data:', formData)
      console.log('Selected Client Company:', selectedClientCompany)
      console.log('Selected Dev Company:', selectedDevCompany)

      // 기존 프로젝트 정보와 새로운 정보를 병합
      const projectData = {
        id: project?.id || 0,
        title: formData.title,
        description: formData.description,
        projectName: formData.title,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        clientCompanyId: formData.clientCompanyId
          ? Number(formData.clientCompanyId)
          : project?.clientCompanyId,
        devCompanyId: formData.devCompanyId
          ? Number(formData.devCompanyId)
          : project?.devCompanyId,
        clientCompanyName: project?.clientCompanyName,
        devCompanyName: project?.devCompanyName,
        clientManagers:
          formData.clientManagers ||
          project?.clientCompanyManagers
            ?.map(name => {
              const employee = clientEmployees.find(emp => emp.name === name)
              return employee ? Number(employee.id) : null
            })
            .filter(Boolean),
        clientMembers:
          formData.clientMembers ||
          project?.clientCompanyMembers
            ?.map(name => {
              const employee = clientEmployees.find(emp => emp.name === name)
              return employee ? Number(employee.id) : null
            })
            .filter(Boolean),
        devManagers:
          formData.devManagers ||
          project?.devCompanyManagers
            ?.map(name => {
              const employee = devEmployees.find(emp => emp.name === name)
              return employee ? Number(employee.id) : null
            })
            .filter(Boolean),
        devMembers:
          formData.devMembers ||
          project?.devCompanyMembers
            ?.map(name => {
              const employee = devEmployees.find(emp => emp.name === name)
              return employee ? Number(employee.id) : null
            })
            .filter(Boolean)
      }

      console.log('Submitting project data:', projectData)

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
    endDate: project?.endDate ? dayjs(project.endDate) : null,
    clientCompanyId: project?.clientCompanyId || '',
    developerCompanyId: project?.devCompanyId || '',
    clientCompanyName: project?.clientCompanyName || '',
    devCompanyName: project?.devCompanyName || '',
    clientManagers: project?.clientCompanyManagers || [],
    clientParticipants: project?.clientCompanyMembers || [],
    developmentManagers: project?.devCompanyManagers || [],
    developmentParticipants: project?.devCompanyMembers || [],
    status: project?.status || ProjectStatus.CONTRACT
  }

  console.log('Initial Form Data in EditProject:', initialFormData)
  console.log('Selected Client Company:', selectedClientCompany)
  console.log('Selected Dev Company:', selectedDevCompany)
  console.log('Client Employees:', clientEmployees)
  console.log('Dev Employees:', devEmployees)

  // CompanyListItem을 Company 타입으로 변환
  const formattedCompanies = companies.map(company => ({
    id: company.id.toString(),
    name: company.name
  }))

  // 모든 직원 목록 합치기
  const formattedEmployees = [...clientEmployees, ...devEmployees]

  console.log('Formatted Companies:', formattedCompanies)
  console.log('Formatted Employees:', formattedEmployees)
  console.log('Selected Client Company:', selectedClientCompany)
  console.log('Selected Dev Company:', selectedDevCompany)
  console.log('Client Employees:', clientEmployees)
  console.log('Dev Employees:', devEmployees)

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
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
