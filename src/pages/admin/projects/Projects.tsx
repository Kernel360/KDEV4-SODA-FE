import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  Button,
  TableCell,
  Typography,
  Paper,
  TableHead,
  TableBody,
  TableRow,
  Chip
} from '@mui/material'
import { LayoutDashboard, Plus } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import useProjectStore from '../../../stores/projectStore'
import { formatDate } from '../../../utils/dateUtils'

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

const Projects = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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
      render: (row: any) => (
        <Typography
          onClick={() => navigate(`/admin/projects/${row.id}`)}
          sx={{
            fontSize: '0.875rem',
            cursor: 'pointer',
            color: theme.palette.primary.main,
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
      render: (row: any) => (
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
      render: (row: any) => (
        <Typography variant="body2">
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </Typography>
      )
    },
    {
      id: 'dashboard',
      label: '대시보드',
      render: (row: any) => (
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

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <DataTable
          columns={columns}
          data={projects.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={projects.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  )
}

export default Projects 