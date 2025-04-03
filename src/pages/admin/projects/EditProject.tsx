import React, { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '@/components/common/ProjectForm'
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

// 임시 프로젝트 데이터 (실제로는 API에서 가져올 데이터)
const mockProject = {
  id: '1',
  name: '샘플 프로젝트',
  description: '이 프로젝트는 샘플 프로젝트입니다.',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  clientCompanyId: '3',
  developerCompanyId: '1',
  selectedEmployees: ['1', '2', '3', '9', '10'],
  managers: ['1', '9'],
  participants: ['2', '3', '10']
}

export default function EditProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [projectData, setProjectData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제로는 API에서 프로젝트 데이터를 가져와야 함
    // 여기서는 임시 데이터를 사용
    const fetchProjectData = async () => {
      try {
        // API 호출 대신 임시 데이터 사용
        setProjectData(mockProject)
        setLoading(false)
      } catch (error) {
        console.error('프로젝트 데이터를 가져오는 중 오류 발생:', error)
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [id])

  const handleSubmit = (formData: any) => {
    console.log('Form submitted:', formData)
    // Add API call here
    navigate('/admin/projects')
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 4 }}>
      <ProjectForm
        companies={mockCompanies}
        employees={mockEmployees}
        onSubmit={handleSubmit}
        initialData={projectData}
        isEdit={true}
      />
    </Container>
  )
}
