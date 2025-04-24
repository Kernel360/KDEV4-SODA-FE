import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Paper
} from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'
import type { Project } from '../../types/project'
import { useUserStore } from '../../stores/userStore'
import { client } from '../../api/client'
import dayjs from 'dayjs'

interface DashboardItem {
  id: number
  title: string
  date: string
  status?: string
}

interface Request {
  requestId: number
  projectId: number
  title: string
  status: string
  createdAt: string
}

interface Article {
  id: number
  articleId: number
  title: string
  status: string
  priority: string
  createdAt: string
  endDate: string | null
  projectId: number
  projectName: string
}

const projectColors = [
  { bg: '#fee2e2', color: '#dc2626' }, // red
  { bg: '#fef3c7', color: '#d97706' }, // amber
  { bg: '#ecfccb', color: '#65a30d' }, // lime
  { bg: '#dcfce7', color: '#16a34a' }, // green
  { bg: '#cffafe', color: '#0891b2' }, // cyan
  { bg: '#dbeafe', color: '#2563eb' }, // blue
  { bg: '#f3e8ff', color: '#9333ea' }, // purple
  { bg: '#fae8ff', color: '#c026d3' }, // fuchsia
  { bg: '#ffe4e6', color: '#e11d48' }, // rose
  { bg: '#f1f5f9', color: '#475569' } // slate
]

const UserDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useUserStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectColorMap, setProjectColorMap] = useState<
    Map<number, { bg: string; color: string }>
  >(new Map())

  useEffect(() => {
    fetchUserProjects()
    if (user?.memberId) {
      fetchRecentRequests()
      fetchRecentArticles()
    }
  }, [user?.memberId])

  useEffect(() => {
    if (recentArticles.length > 0) {
      const uniqueProjects = Array.from(
        new Set(recentArticles.map(a => a.projectId))
      )
      const newProjectColorMap = new Map()
      uniqueProjects.forEach((projectId, index) => {
        newProjectColorMap.set(
          projectId,
          projectColors[index % projectColors.length]
        )
      })
      setProjectColorMap(newProjectColorMap)
    }
  }, [recentArticles])

  const fetchUserProjects = async () => {
    try {
      setLoading(true)
      const userProjects = await projectService.getUserProjects()
      setProjects(userProjects)
    } catch (err) {
      console.error('프로젝트 목록 조회 중 오류:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : '프로젝트 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentRequests = async () => {
    try {
      const response = await client.get(`/members/${user.memberId}/requests`, {
        params: {
          page: 0,
          size: 3
        }
      })
      if (response.data.status === 'success') {
        setRecentRequests(response.data.data.content)
      }
    } catch (error) {
      console.error('최근 요청사항 조회 중 오류:', error)
      showToast('최근 요청사항을 불러오는데 실패했습니다.', 'error')
    }
  }

  const fetchRecentArticles = async () => {
    try {
      const response = await client.get('/articles/my', {
        params: {
          page: 0,
          size: 3,
          sort: 'createdAt,desc'
        }
      })
      if (response.data.status === 'success') {
        setRecentArticles(response.data.data.content)
      }
    } catch (error) {
      console.error('최근 게시글 조회 중 오류:', error)
      showToast('최근 게시글을 불러오는데 실패했습니다.', 'error')
    }
  }

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const recentQuestions: DashboardItem[] = [
    { id: 1, title: '질문 1', date: '2024-03-15' },
    { id: 2, title: '질문 2', date: '2024-03-14' },
    { id: 3, title: '질문 3', date: '2024-03-13' }
  ]

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
  const handleItemClick = (
    type: string,
    id: number,
    projectId?: number,
    articleId?: number
  ) => {
    switch (type) {
      case 'request':
        if (projectId) {
          navigate(`/user/projects/${projectId}/requests/${id}`)
        }
        break
      case 'article':
        if (projectId && articleId) {
          navigate(`/user/projects/${projectId}/articles/${articleId}`)
        }
        break
      case 'project':
        navigate(`/user/projects/${id}`)
        break
      default:
        break
    }
  }

  const renderDashboardSection = (
    title: string,
    items: any[],
    type: string,
    viewAllLink: string
  ) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider'
      }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography variant="h6">{title}</Typography>
        <Button
          variant="text"
          onClick={() => navigate(viewAllLink)}
          sx={{ color: 'text.secondary' }}>
          전체보기
        </Button>
      </Box>
      <List>
        {type === 'request' ? (
          recentRequests.map((request, index) => (
            <React.Fragment key={request.requestId}>
              <ListItem
                button
                onClick={() =>
                  handleItemClick(type, request.requestId, request.projectId)
                }
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2
                }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ mb: 1 }}>
                    {request.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary">
                    {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusText(request.status)}
                  sx={{
                    ...getStatusColor(request.status),
                    ml: 2
                  }}
                />
              </ListItem>
              {index < recentRequests.length - 1 && (
                <Box
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              )}
            </React.Fragment>
          ))
        ) : type === 'article' ? (
          recentArticles.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="text.secondary">
                작성한 질문이 없습니다.
              </Typography>
            </Box>
          ) : (
            recentArticles.map((article, index) => (
              <React.Fragment key={article.id}>
                <ListItem
                  button
                  onClick={() =>
                    handleItemClick(
                      type,
                      article.id,
                      article.projectId,
                      article.articleId
                    )
                  }
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2
                  }}>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                      <Typography
                        variant="body1"
                        sx={{
                          flex: 1,
                          fontWeight: 500
                        }}>
                        {article.title}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={article.projectName}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            height: '24px',
                            backgroundColor:
                              projectColorMap.get(article.projectId)?.bg ||
                              '#e2e8f0',
                            color:
                              projectColorMap.get(article.projectId)?.color ||
                              '#475569',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor:
                                projectColorMap.get(article.projectId)?.bg ||
                                '#e2e8f0'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                      <Typography
                        variant="body2"
                        color="text.secondary">
                        {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {article.endDate && (
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: '#f3f4f6',
                              color: '#4b5563',
                              fontSize: '0.75rem'
                            }}>
                            마감: {dayjs(article.endDate).format('YYYY-MM-DD')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
                {index < recentArticles.length - 1 && (
                  <Box
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                )}
              </React.Fragment>
            ))
          )
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                button
                onClick={() => handleItemClick(type, item.id)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2
                }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary">
                    {dayjs(item.date).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                </Box>
                {item.status && (
                  <Chip
                    label={item.status}
                    sx={{
                      ml: 2,
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563'
                    }}
                  />
                )}
              </ListItem>
              {index < items.length - 1 && (
                <Box
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              )}
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  )

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Grid
        container
        spacing={3}>
        <Grid
          item
          xs={12}
          md={6}>
          {renderDashboardSection(
            '최근 요청사항',
            [],
            'request',
            '/user/requests'
          )}
        </Grid>
        <Grid
          item
          xs={12}
          md={6}>
          {renderDashboardSection('최근 질문', [], 'article', '/user/articles')}
        </Grid>
        <Grid
          item
          xs={12}>
          {renderDashboardSection(
            '진행 중인 프로젝트',
            projects.map(project => ({
              id: project.id,
              title: project.title,
              date: project.startDate,
              status: project.status
            })),
            'project',
            '/user/projects'
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserDashboard
