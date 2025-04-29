import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import { client } from '../../api/client'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../contexts/ToastContext'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
import { projectService } from '../../services/projectService'

interface Request {
  requestId: number
  projectId: number
  title: string
  status: string
  createdAt: string
}

const UserRequests: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useUserStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [projectNames, setProjectNames] = useState<{ [projectId: number]: string }>({})
  const [myProjects, setMyProjects] = useState<{ id: number; title: string }[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>('')

  useEffect(() => {
    if (user?.memberId) {
      fetchRequests()
    }
  // eslint-disable-next-line
  }, [user?.memberId, page, activeSearchTerm, selectedProjectId])

  useEffect(() => {
    // 내 프로젝트 목록 불러오기
    const fetchMyProjects = async () => {
      try {
        const projects = await projectService.getUserProjects()
        setMyProjects(projects.map((p: any) => ({ id: p.id || p.projectId, title: p.title || p.projectName || p.name })))
      } catch (e) {
        setMyProjects([])
      }
    }
    fetchMyProjects()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: page - 1,
        size: 10,
        keyword: activeSearchTerm.trim() || undefined
      }
      if (selectedProjectId) {
        params.projectId = selectedProjectId
      }
      const response = await client.get(`/members/${user.memberId}/requests`, {
        params
      })
      if (response.data.status === 'success') {
        setRequests(response.data.data.content)
        setTotalPages(response.data.data.page.totalPages)
        // 프로젝트명 가져오기
        const uniqueProjectIds = Array.from(new Set(response.data.data.content.map((r: Request) => r.projectId)))
        const newProjectNames: { [projectId: number]: string } = { ...projectNames }
        await Promise.all(uniqueProjectIds.map(async (projectId: number) => {
          if (!newProjectNames[projectId]) {
            try {
              const project = await projectService.getProjectById(projectId)
              newProjectNames[projectId] = project.title || project.projectName || project.name || `프로젝트 ${projectId}`
            } catch {
              newProjectNames[projectId] = `프로젝트 ${projectId}`
            }
          }
        }))
        setProjectNames(newProjectNames)
      }
    } catch (error) {
      console.error('요청사항 목록 조회 중 오류:', error)
      showToast('요청사항 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    setActiveSearchTerm(searchTerm)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인'
      case 'REJECTED':
        return '거절'
      case 'PENDING':
        return '대기'
      case 'APPROVING':
        return '승인중'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: '#16a34a',
          backgroundColor: '#dcfce7'
        }
      case 'REJECTED':
        return {
          color: '#dc2626',
          backgroundColor: '#fee2e2'
        }
      case 'PENDING':
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
      default:
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
    }
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        요청사항 목록
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ position: 'relative', minWidth: 180 }}>
          <span
            id="project-select-label"
            style={{
              position: 'absolute',
              top: -10,
              left: 12,
              fontSize: 13,
              background: '#f6f7f8',
              padding: '0 4px',
              color: '#888',
              zIndex: 2,
              transition: 'color 0.2s',
              pointerEvents: 'none',
            }}
            className={selectedProjectId !== '' ? 'project-label-active' : ''}
          >
            프로젝트
          </span>
          <FormControl size="small" sx={{ minWidth: 180, width: '100%' }}>
            <Select
              value={selectedProjectId}
              onFocus={e => {
                const label = document.getElementById('project-select-label')
                if (label) label.style.color = '#FFB800'
              }}
              onBlur={e => {
                const label = document.getElementById('project-select-label')
                if (label) label.style.color = '#888'
              }}
              onChange={e => {
                setSelectedProjectId(e.target.value === '' ? '' : Number(e.target.value))
                setPage(1)
              }}
              displayEmpty
              renderValue={selected =>
                selected == '' || selected === undefined
                  ? <span>전체</span>
                  : myProjects.find(p => p.id === Number(selected))?.title
              }
            >
              <MenuItem value="">전체</MenuItem>
              {myProjects.map(project => (
                <MenuItem key={project.id} value={project.id}>{project.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: 80 }}
        >
          검색
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>프로젝트</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>생성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.requestId}
                hover
                onClick={() => navigate(`/user/projects/${request.projectId}/requests/${request.requestId}`)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{projectNames[request.projectId] || '-'}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(request.status)}
                    sx={getStatusColor(request.status)}
                  />
                </TableCell>
                <TableCell>
                  {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={3}>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        )}
      </Box>
    </Box>
  )
}

export default UserRequests 