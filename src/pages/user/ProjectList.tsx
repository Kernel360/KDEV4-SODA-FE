import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, useTheme, Chip } from '@mui/material'
import { LayoutDashboard } from 'lucide-react'
import { projectService } from '../../services/projectService'
import { Project, ProjectStatus } from '../../types/project'
import { formatDate } from '../../utils/dateUtils'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const getStatusText = (status: string): string => {
  switch (status) {
    case 'CONTRACT':
      return '계약'
    case 'IN_PROGRESS':
      return '진행중'
    case 'DELIVERED':
      return '납품완료'
    case 'MAINTENANCE':
      return '하자보수'
    case 'ON_HOLD':
      return '일시중단'
    default:
      return '대기'
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'CONTRACT':
      return '#64748B'
    case 'IN_PROGRESS':
      return '#2563EB'
    case 'DELIVERED':
      return '#059669'
    case 'MAINTENANCE':
      return '#9333EA'
    case 'ON_HOLD':
      return '#DC2626'
    default:
      return '#64748B'
  }
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await projectService.getUserProjects()
        if (Array.isArray(response)) {
          setProjects(response)
        } else if (response?.data) {
          setProjects(response.data)
        } else {
          setProjects([])
        }
      } catch (err) {
        console.error('프로젝트 로딩 에러:', err)
        setError('프로젝트 목록을 불러오는데 실패했습니다. 다시 시도해주세요.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const columns = [
    {
      id: 'title',
      label: '프로젝트명',
      render: (row: Project) => (
        <Typography
          onClick={() => navigate(`/user/projects/${row.id}`)}
          sx={{
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:hover': {
              color: theme.palette.primary.dark,
              textDecoration: 'underline'
            }
          }}>
          {row.title}
        </Typography>
      )
    },
    {
      id: 'status',
      label: '상태',
      render: (row: Project) => (
        <Chip
          label={getStatusText(row.status)}
          size="small"
          sx={{
            backgroundColor: getStatusColor(row.status),
            color: 'white',
            fontWeight: 500
          }}
        />
      )
    },
    {
      id: 'period',
      label: '기간',
      render: (row: Project) => (
        <Typography variant="body2">
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </Typography>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // 현재 페이지에 해당하는 데이터만 추출
  const currentPageData = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <DataTable
      columns={columns}
      data={currentPageData}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={projects.length}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  )
}

export default ProjectList
