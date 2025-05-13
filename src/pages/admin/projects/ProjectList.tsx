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
  Paper,
  Tooltip
} from '@mui/material'
import { LayoutDashboard, Search, PlusCircle, SettingsIcon } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { Project } from '../../../types/project'
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
      return '#FFB800'
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
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
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
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({
    '': 0,
    CONTRACT: 0,
    IN_PROGRESS: 0,
    DELIVERED: 0,
    MAINTENANCE: 0,
    ON_HOLD: 0
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await projectService.getAllProjects()
        if (Array.isArray(response)) {
          setProjects(response)
          setFilteredProjects(response)
          const counts = {
            '': response.length,
            CONTRACT: response.filter(p => p.status === 'CONTRACT').length,
            IN_PROGRESS: response.filter(p => p.status === 'IN_PROGRESS')
              .length,
            DELIVERED: response.filter(p => p.status === 'DELIVERED').length,
            MAINTENANCE: response.filter(p => p.status === 'MAINTENANCE')
              .length,
            ON_HOLD: response.filter(p => p.status === 'ON_HOLD').length
          }
          setStatusCounts(counts)
        } else {
          setProjects([])
          setFilteredProjects([])
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

  useEffect(() => {
    const status = searchParams.get('status') || ''
    const keyword = searchParams.get('keyword') || ''
    const filtered = projects.filter(project => {
      const matchesStatus = status ? project.status === status : true
      const matchesKeyword = keyword ? project.title.includes(keyword) : true
      return matchesStatus && matchesKeyword
    })
    setFilteredProjects(filtered)
  }, [searchParams, projects])

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
        <Tooltip
          title={row.title}
          arrow>
          <Typography
            sx={{
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px',
              display: 'block',
              '&:hover': {
                color: theme.palette.primary.dark
              }
            }}>
            {row.title}
          </Typography>
        </Tooltip>
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
          variant="outlined"
          onClick={() => navigate(`/user/projects/${row.id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E293B',
            bgcolor: 'white',
            border: '1px solid #E2E8F0',
            '&:hover': {
              bgcolor: '#FFF8E6'
            },
            width: '45px',
            height: '45px',
            minWidth: '45px',
            minHeight: '45px',
            m: 'auto'
          }}>
          <LayoutDashboard size={48} />
        </Button>
      )
    },
    {
      id: 'management',
      label: '관리',
      render: (row: Project) => (
        <Button
          variant="outlined"
          onClick={() => navigate(`/admin/projects/${row.id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E293B',
            bgcolor: 'white',
            border: '1px solid #E2E8F0',
            '&:hover': {
              bgcolor: '#FFF8E6'
            },
            width: '45px',
            height: '45px',
            minWidth: '45px',
            minHeight: '45px',
            m: 'auto'
          }}>
          <SettingsIcon size={48} />
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
          {/* 상태 필터 버튼 */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 2, width: '100%' }}>
            {PROJECT_STATUSES.map(status => {
              const count = statusCounts[status.value]
              const statusColor =
                status.value === '' ? '#64748B' : getStatusColor(status.value)

              return (
                <Paper
                  key={status.value}
                  elevation={0}
                  onClick={() => handleStatusChange(status.value)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flex: 1,
                    bgcolor:
                      selectedStatus === status.value
                        ? `${statusColor}10`
                        : 'white',
                    border: '1px solid',
                    borderColor:
                      selectedStatus === status.value ? statusColor : '#E2E8F0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: `${statusColor}10`,
                      borderColor: statusColor
                    }
                  }}>
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: selectedStatus === status.value ? 600 : 400,
                        color: '#1E293B',
                        mb: 0.5
                      }}>
                      {status.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: statusColor
                      }}>
                      {count}건
                    </Typography>
                  </Box>
                </Paper>
              )
            })}
          </Stack>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2
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
                      sx={{
                        minWidth: 'auto',
                        color: '#1E293B'
                      }}>
                      <Search size={20} />
                    </Button>
                  </InputAdornment>
                ),
                sx: {
                  height: '38px'
                }
              }}
              sx={{
                width: '400px',
                '& .MuiOutlinedInput-root': {
                  height: '38px'
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<PlusCircle size={18} />}
              onClick={() => navigate('/admin/projects/create')}
              sx={{
                bgcolor: 'primary.main', // 테마 기본 색상 사용 또는 원하는 색상 지정
                '&:hover': {
                  bgcolor: 'primary.dark' // 호버 시 약간 어둡게
                },
                color: 'white',
                minWidth: '140px',
                height: '38px',
                fontSize: '0.875rem'
              }}>
              프로젝트 추가
            </Button>
          </Box>
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        data={filteredProjects.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredProjects.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Box>
  )
}

export default ProjectList
