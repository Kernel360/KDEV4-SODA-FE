import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { Plus } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'

interface Project {
  id: number
  name: string
  client: string
  developer: string
  startDate: string
  endDate: string
}

// Mock data generator
const generateMockProjects = (count: number): Project[] => {
  const companies = [
    '삼성전자',
    'LG전자',
    'SK하이닉스',
    '현대자동차',
    '네이버',
    '카카오',
    'KT',
    'LG CNS'
  ]
  const developers = [
    '테크솔루션',
    '클라우드테크',
    '모바일솔루션',
    '시스템인테그레이션',
    '데이터테크'
  ]
  const projects = [
    'AI 챗봇',
    '클라우드 마이그레이션',
    '모바일 앱',
    'ERP 시스템',
    '빅데이터 플랫폼',
    'IoT 플랫폼',
    '블록체인'
  ]

  return Array.from({ length: count }, (_, index) => {
    const startDate = new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 6) + 3)

    return {
      id: index + 1,
      name: `${projects[Math.floor(Math.random() * projects.length)]} ${index + 1}차`,
      client: companies[Math.floor(Math.random() * companies.length)],
      developer: developers[Math.floor(Math.random() * developers.length)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  })
}

const mockProjects = generateMockProjects(50)

const ProjectList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  // 현재 페이지에 해당하는 데이터만 추출
  const currentPageData = mockProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const columns = [
    {
      id: 'name',
      label: '프로젝트명',
      render: (row: Project) => row.name,
      onClick: (row: Project) => navigate(`/admin/projects/${row.id}`)
    },
    {
      id: 'client',
      label: '고객사',
      render: (row: Project) => row.client
    },
    {
      id: 'developer',
      label: '개발사',
      render: (row: Project) => row.developer
    },
    {
      id: 'startDate',
      label: '시작 날짜',
      render: (row: Project) => row.startDate
    },
    {
      id: 'endDate',
      label: '마감 날짜',
      render: (row: Project) => row.endDate
    }
  ]

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600 }}>
          전체 프로젝트 현황
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/admin/projects/create')}
          sx={{
            backgroundColor: 'black',
            '&:hover': {
              backgroundColor: 'black'
            }
          }}>
          새 프로젝트
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={currentPageData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={mockProjects.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  )
}

export default ProjectList
