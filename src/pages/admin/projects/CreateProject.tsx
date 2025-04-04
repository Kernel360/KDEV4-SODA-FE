import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '../../../components/common/ProjectForm'
import { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'

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
        projectNumber: `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        status: '준비',
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
        <Typography
          variant="h5"
          sx={{ mb: 3 }}>
          프로젝트 생성
        </Typography>
        <ProjectForm
          companies={mockCompanies}
          employees={mockEmployees}
          onSubmit={handleSubmit}
          isEdit={false}
        />
      </Paper>
    </Box>
  )
}

export default CreateProject
