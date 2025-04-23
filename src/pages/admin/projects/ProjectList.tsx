import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Paper
} from '@mui/material'
import { LayoutDashboard, Search, Plus } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { Project, ProjectStatus } from '../../../types/project'
import dayjs from 'dayjs'
import DataTable from '../../../components/common/DataTable'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

const PROJECT_STATUSES = [
  { value: '', label: '전체' },
  { value: 'CONTRACT', label: '계약' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'DELIVERED', label: '납품완료' },
  { value: 'MAINTENANCE', label: '하자보수' },
  { value: 'ON_HOLD', label: '일시중단' }
]

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.get('keyword') || ''
  )
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || ''
  )

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const status = searchParams.get('status') || ''
        const keyword = searchParams.get('keyword') || ''
        const response = await projectService.getAllProjects(status, keyword)
        if (Array.isArray(response)) {
          setProjects(response)
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
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedStatus) params.set('status', selectedStatus)
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim())
    setSearchParams(params)
    setPage(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    const params = new URLSearchParams(searchParams)
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    if (searchKeyword) params.set('keyword', searchKeyword)
    setSearchParams(params)
    setPage(0)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${dayjs(startDate).format('YYYY년 M월 D일')} ~ ${dayjs(endDate).format('YYYY년 M월 D일')}`
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
          {formatDateRange(row.startDate, row.endDate)}
        </Typography>
      )
    },
    {
      id: 'dashboard',
      label: '대시보드',
      render: (row: Project) => (
        <Button
          variant="contained"
          startIcon={<LayoutDashboard size={20} />}
          onClick={() => navigate(`/user/projects/${row.id}`)}
          sx={{
            bgcolor: '#FFB800',
            '&:hover': {
              bgcolor: '#E5A600'
            },
            fontSize: '0.875rem',
            py: 0.5,
            px: 1.5
          }}>
          대시보드
        </Button>
      )
    }
  ]

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6
            }}>
            <TextField
              size="small"
              placeholder="프로젝트 검색"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={handleSearch}
                      sx={{ minWidth: 'auto' }}>
                      <Search size={20} />
                    </Button>
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => navigate('/admin/projects/create')}
              sx={{
                bgcolor: '#FFB800',
                '&:hover': {
                  bgcolor: '#E5A600'
                },
                minWidth: '200px'
              }}>
              프로젝트 추가하기
            </Button>
          </Box>

          {/* 상태 필터 버튼 */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2 }}>
            {PROJECT_STATUSES.map(status => (
              <Button
                key={status.value}
                variant={
                  selectedStatus === status.value ? 'contained' : 'outlined'
                }
                onClick={() => handleStatusChange(status.value)}
                sx={{
                  bgcolor:
                    selectedStatus === status.value ? '#FFB800' : 'white',
                  color: selectedStatus === status.value ? 'white' : '#666',
                  border: '1px solid',
                  borderColor:
                    selectedStatus === status.value ? '#FFB800' : '#E0E0E0',
                  '&:hover': {
                    bgcolor:
                      selectedStatus === status.value ? '#E5A600' : '#f5f5f5',
                    borderColor:
                      selectedStatus === status.value ? '#E5A600' : '#E0E0E0'
                  },
                  flex: 1
                }}>
                {status.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        data={projects.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={projects.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Box>
  )
}

export default ProjectList
