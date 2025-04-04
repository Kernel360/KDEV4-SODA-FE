import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import dayjs from 'dayjs'

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockCompanies = [
  { id: '1', name: '개발사 A' },
  { id: '2', name: '개발사 B' },
  { id: '3', name: '고객사 A' },
  { id: '4', name: '고객사 B' }
]

const mockEmployees = [
  // 개발사 A 직원
  { id: '1', name: '김개발', companyId: '1', position: '개발자' },
  { id: '2', name: '이개발', companyId: '1', position: '개발자' },
  { id: '3', name: '박개발', companyId: '1', position: '개발자' },
  { id: '4', name: '최개발', companyId: '1', position: '개발자' },

  // 개발사 B 직원
  { id: '5', name: '정개발', companyId: '2', position: '개발자' },
  { id: '6', name: '강개발', companyId: '2', position: '개발자' },
  { id: '7', name: '조개발', companyId: '2', position: '개발자' },
  { id: '8', name: '윤개발', companyId: '2', position: '개발자' },

  // 고객사 A 직원
  { id: '9', name: '김고객', companyId: '3', position: '매니저' },
  { id: '10', name: '이고객', companyId: '3', position: '매니저' },
  { id: '11', name: '박고객', companyId: '3', position: '매니저' },
  { id: '12', name: '최고객', companyId: '3', position: '매니저' },

  // 고객사 B 직원
  { id: '13', name: '정고객', companyId: '4', position: '매니저' },
  { id: '14', name: '강고객', companyId: '4', position: '매니저' },
  { id: '15', name: '조고객', companyId: '4', position: '매니저' },
  { id: '16', name: '윤고객', companyId: '4', position: '매니저' }
]

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [project, setProject] = React.useState<Project | null>(null)

  React.useEffect(() => {
    // 실제로는 API에서 프로젝트 데이터를 가져옵니다
    // 임시로 더미 데이터를 사용합니다
    const dummyProject: Project = {
      id: Number(id),
      name: '프로젝트 A',
      description: '프로젝트 A에 대한 설명입니다.',
      projectNumber: 'PRJ-2024-001',
      status: '진행중',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      clientCompany: '고객사 A',
      clientManagers: [
        { name: '김고객', position: '매니저', email: 'kim@client.com' }
      ],
      clientParticipants: [
        { name: '이고객', position: '매니저', email: 'lee@client.com' },
        { name: '박고객', position: '매니저', email: 'park@client.com' }
      ],
      developmentCompany: '개발사 A',
      developmentManagers: [
        { name: '김개발', position: '개발자', email: 'kim@dev.com' }
      ],
      developmentParticipants: [
        { name: '이개발', position: '개발자', email: 'lee@dev.com' },
        { name: '박개발', position: '개발자', email: 'park@dev.com' }
      ],
      systemManager: '최개발'
    }

    setProject(dummyProject)
    setLoading(false)
  }, [id])

  const handleSubmit = async (formData: any) => {
    try {
      // ProjectFormData를 Project 타입으로 변환
      const projectData: Project = {
        id: Number(id),
        name: formData.name,
        description: formData.description,
        projectNumber: project?.projectNumber || '',
        status: project?.status || '진행중',
        startDate: formData.startDate?.format('YYYY-MM-DD') || '',
        endDate: formData.endDate?.format('YYYY-MM-DD') || '',
        clientCompany:
          mockCompanies.find(c => c.id === formData.clientCompanyId)?.name ||
          '',
        clientManagers: mockEmployees
          .filter(
            emp =>
              formData.managers.includes(emp.id) &&
              emp.companyId === formData.clientCompanyId
          )
          .map(emp => ({
            name: emp.name,
            position: emp.position,
            email: `${emp.name.toLowerCase()}@client.com`
          })),
        clientParticipants: mockEmployees
          .filter(
            emp =>
              formData.participants.includes(emp.id) &&
              emp.companyId === formData.clientCompanyId
          )
          .map(emp => ({
            name: emp.name,
            position: emp.position,
            email: `${emp.name.toLowerCase()}@client.com`
          })),
        developmentCompany:
          mockCompanies.find(c => c.id === formData.developerCompanyId)?.name ||
          '',
        developmentManagers: mockEmployees
          .filter(
            emp =>
              formData.managers.includes(emp.id) &&
              emp.companyId === formData.developerCompanyId
          )
          .map(emp => ({
            name: emp.name,
            position: emp.position,
            email: `${emp.name.toLowerCase()}@dev.com`
          })),
        developmentParticipants: mockEmployees
          .filter(
            emp =>
              formData.participants.includes(emp.id) &&
              emp.companyId === formData.developerCompanyId
          )
          .map(emp => ({
            name: emp.name,
            position: emp.position,
            email: `${emp.name.toLowerCase()}@dev.com`
          })),
        systemManager:
          mockEmployees.find(emp => formData.managers.includes(emp.id))?.name ||
          ''
      }

      // 실제로는 API를 호출하여 프로젝트를 업데이트합니다
      console.log('Updated project:', projectData)
      showToast('프로젝트가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/projects/${id}`)
    } catch (error) {
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
    name: project.name,
    description: project.description,
    startDate: project.startDate ? dayjs(project.startDate) : null,
    endDate: project.endDate ? dayjs(project.endDate) : null,
    clientCompanyId:
      mockCompanies.find(c => c.name === project.clientCompany)?.id || '',
    developerCompanyId:
      mockCompanies.find(c => c.name === project.developmentCompany)?.id || '',
    selectedEmployees: [
      ...project.clientManagers.map(
        m => mockEmployees.find(e => e.name === m.name)?.id || ''
      ),
      ...project.clientParticipants.map(
        p => mockEmployees.find(e => e.name === p.name)?.id || ''
      ),
      ...project.developmentManagers.map(
        m => mockEmployees.find(e => e.name === m.name)?.id || ''
      ),
      ...project.developmentParticipants.map(
        p => mockEmployees.find(e => e.name === p.name)?.id || ''
      )
    ].filter(id => id !== ''),
    managers: [
      ...project.clientManagers.map(
        m => mockEmployees.find(e => e.name === m.name)?.id || ''
      ),
      ...project.developmentManagers.map(
        m => mockEmployees.find(e => e.name === m.name)?.id || ''
      )
    ].filter(id => id !== ''),
    participants: [
      ...project.clientParticipants.map(
        p => mockEmployees.find(e => e.name === p.name)?.id || ''
      ),
      ...project.developmentParticipants.map(
        p => mockEmployees.find(e => e.name === p.name)?.id || ''
      )
    ].filter(id => id !== '')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3 }}>
          {project.name}
        </Typography>
        <ProjectForm
          companies={mockCompanies}
          employees={mockEmployees}
          onSubmit={handleSubmit}
          initialData={initialFormData}
          isEdit={true}
        />
      </Paper>
    </Box>
  )
}

export default EditProject
