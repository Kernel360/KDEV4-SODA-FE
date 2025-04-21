import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, useTheme, Chip } from '@mui/material'
import { Plus, LayoutDashboard } from 'lucide-react'
import useProjectStore from '../../../stores/projectStore'
import DataTable from '../../../components/common/DataTable'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { formatDate } from '../../../utils/dateUtils'
import type { Project } from '../../../types/project'

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
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const theme = useTheme()

  useEffect(() => {
    fetchAllProjects()
  }, [fetchAllProjects])

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
          onClick={() => navigate(`/admin/projects/${row.id}`)}
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
    },
    {
      id: 'dashboard',
      label: '대시보드',
      render: (row: Project) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<LayoutDashboard size={16} />}
          onClick={() => navigate(`/user/projects/${row.id}`)}
          sx={{
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            backgroundColor: '#FBBF24',
            '&:hover': {
              backgroundColor: '#FCD34D'
            },
            color: '#ffffff'
          }}>
          대시보드
        </Button>
      )
    }
  ]

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchAllProjects}
      />
    )
  }

  // 현재 페이지에 해당하는 데이터만 추출
  const currentPageData = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

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
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={projects.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  )
}

export default ProjectList
