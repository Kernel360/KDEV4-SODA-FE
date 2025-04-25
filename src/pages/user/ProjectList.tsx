import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  useTheme,
  Chip,
  Paper,
  List,
  ListItem,
  Pagination
} from '@mui/material'
import { client } from '../../api/client'
import { useToast } from '../../contexts/ToastContext'
import dayjs from 'dayjs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

interface Project {
  projectId: number
  title: string
  status: string
  startDate: string
  endDate: string
  companyProjectRole: string
  memberProjectRole: string | null
}

interface PageInfo {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    size: 5,
    number: 0,
    totalElements: 0,
    totalPages: 0
  })

  const fetchCompanyProjects = async (page: number = 0) => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.get('/projects/my-company', {
        params: {
          page,
          size: 5
        }
      })
      if (response.data.status === 'success') {
        setProjects(response.data.data.content)
        setPageInfo(response.data.data.page)
      }
    } catch (err) {
      console.error('프로젝트 로딩 에러:', err)
      setError('프로젝트 목록을 불러오는데 실패했습니다. 다시 시도해주세요.')
      showToast('프로젝트 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyProjects()
  }, [])

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    fetchCompanyProjects(page - 1) // API는 0-based index 사용
  }

  const getProjectStatusText = (status: string) => {
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
        return status
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'CONTRACT':
        return { bg: '#ffffff', color: '#64748B', border: '1px solid #64748B' }
      case 'IN_PROGRESS':
        return { bg: '#ffffff', color: '#FFB800', border: '1px solid #FFB800' }
      case 'DELIVERED':
        return { bg: '#ffffff', color: '#22C55E', border: '1px solid #22C55E' }
      case 'MAINTENANCE':
        return { bg: '#ffffff', color: '#8B5CF6', border: '1px solid #8B5CF6' }
      case 'ON_HOLD':
        return { bg: '#ffffff', color: '#EF4444', border: '1px solid #EF4444' }
      default:
        return { bg: '#ffffff', color: '#FFB800', border: '1px solid #FFB800' }
    }
  }

  const getMemberRoleText = (role: string | null) => {
    if (!role) return ''
    switch (role) {
      case 'DEV_MANAGER':
        return '개발사 담당자'
      case 'DEV_PARTICIPANT':
        return '개발사 일반 참여자'
      case 'CLI_MANAGER':
        return '고객사 담당자'
      case 'CLI_PARTICIPANT':
        return '고객사 일반 참여자'
      default:
        return role
    }
  }

  const getMemberRoleColor = (role: string | null) => {
    if (!role)
      return { bg: '#ffffff', color: '#4b5563', border: '1px solid #4b5563' }
    switch (role) {
      case 'DEV_MANAGER':
        return { bg: '#ffffff', color: '#2563eb', border: '1px solid #2563eb' }
      case 'DEV_PARTICIPANT':
        return { bg: '#ffffff', color: '#0284c7', border: '1px solid #0284c7' }
      case 'CLI_MANAGER':
        return { bg: '#ffffff', color: '#16a34a', border: '1px solid #16a34a' }
      case 'CLI_PARTICIPANT':
        return { bg: '#ffffff', color: '#65a30d', border: '1px solid #65a30d' }
      default:
        return { bg: '#ffffff', color: '#4b5563', border: '1px solid #4b5563' }
    }
  }

  const handleProjectClick = (project: Project) => {
    if (!project.memberProjectRole) {
      showToast('참여하지 않는 프로젝트는 접근할 수 없습니다', 'error')
      return
    }
    navigate(`/user/projects/${project.projectId}`)
  }

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

  return (
    <Box>
      <List>
        {projects.map((project, index) => (
          <React.Fragment key={project.projectId}>
            <ListItem
              button
              onClick={() => handleProjectClick(project)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2
              }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500 }}>
                      {project.title}
                    </Typography>
                    <Chip
                      label={getProjectStatusText(project.status)}
                      size="small"
                      sx={{
                        backgroundColor: getProjectStatusColor(project.status)
                          .bg,
                        color: getProjectStatusColor(project.status).color,
                        border: getProjectStatusColor(project.status).border,
                        height: '24px'
                      }}
                    />
                  </Box>
                  {project.memberProjectRole && (
                    <Chip
                      label={getMemberRoleText(project.memberProjectRole)}
                      size="small"
                      sx={{
                        backgroundColor: getMemberRoleColor(
                          project.memberProjectRole
                        ).bg,
                        color: getMemberRoleColor(project.memberProjectRole)
                          .color,
                        border: getMemberRoleColor(project.memberProjectRole)
                          .border,
                        height: '24px'
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary">
                  {dayjs(project.startDate).format('YYYY년 M월 D일')} ~{' '}
                  {dayjs(project.endDate).format('YYYY년 M월 D일')}
                </Typography>
              </Box>
            </ListItem>
            {index < projects.length - 1 && (
              <Box
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </List>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3
        }}>
        <Pagination
          count={pageInfo.totalPages}
          page={pageInfo.number + 1} // 1-based index로 표시
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  )
}

export default ProjectList
