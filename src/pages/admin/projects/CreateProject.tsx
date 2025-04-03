import React from 'react'
import { Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '@/components/common/ProjectForm'

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

  const handleSubmit = (formData: any) => {
    console.log('Form submitted:', formData)
    // Add API call here
    navigate('/admin/projects')
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 4 }}>
      <ProjectForm
        companies={mockCompanies}
        employees={mockEmployees}
        onSubmit={handleSubmit}
        isEdit={false}
      />
    </Container>
  )
}

export default CreateProject
