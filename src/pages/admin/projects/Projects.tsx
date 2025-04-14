import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  Button,
  TableCell,
  Typography,
  Paper
} from '@mui/material'
import { LayoutDashboard, Plus } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import useProjectStore from '../../../stores/projectStore'

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
      id: 'clientCompany',
      label: '고객사',
      render: (row: any) => (
        <TableCell>{row.clientCompanyName}</TableCell>
      )
    },
    {
      id: 'devCompany',
      label: '개발사',
      render: (row: any) => (
        <TableCell>{row.devCompanyName}</TableCell>
      )
    },
    {
      id: 'status',
      label: '상태',
      render: (row: any) => (
        <Typography
          sx={{
            fontSize: '0.813rem',
            fontWeight: 500,
            color: row.status === '진행 중' ? theme.palette.success.main :
                   row.status === '완료' ? theme.palette.info.main :
                   row.status === '중단' ? theme.palette.error.main :
                   theme.palette.text.secondary
          }}>
          {row.status || '대기'}
        </Typography>
      )
    },
    {
      id: 'dashboard',
      label: '대시보드 바로가기',
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