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
  TableCell
} from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'
import type { Project } from '../../types/project'

interface DashboardItem {
  id: number
  title: string
  date: string
  status?: string
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProjects()
  }, [])

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

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const recentRequests: DashboardItem[] = [
    { id: 1, title: '요청사항 1', date: '2024-03-15', status: '진행중' },
    { id: 2, title: '요청사항 2', date: '2024-03-14', status: '완료' },
    { id: 3, title: '요청사항 3', date: '2024-03-13', status: '대기중' }
  ]

  const recentQuestions: DashboardItem[] = [
    { id: 1, title: '질문 1', date: '2024-03-15' },
    { id: 2, title: '질문 2', date: '2024-03-14' },
    { id: 3, title: '질문 3', date: '2024-03-13' }
  ]

  const handleItemClick = (type: string, id: number) => {
    switch (type) {
      case 'request':
        navigate(`/requests/${id}`)
        break
      case 'question':
        navigate(`/questions/${id}`)
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
    items: DashboardItem[],
    type: string,
    viewAllPath: string
  ) => {
    const getStatusText = (status: string | undefined) => {
      switch (status) {
        case 'IN_PROGRESS':
          return '진행중'
        case 'COMPLETED':
          return '완료'
        case 'PENDING':
          return '대기중'
        case 'CANCELLED':
          return '취소'
        default:
          return status || ''
      }
    }

    if (type === 'project') {
      return (
        <Card sx={{ minHeight: '300px', height: '100%' }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
              <Typography
                variant="h6"
                component="div">
                {title}
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate(viewAllPath)}>
                전체보기
              </Button>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>프로젝트명</TableCell>
                      <TableCell>시작일</TableCell>
                      <TableCell>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map(item => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleItemClick(type, item.id)}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                item.status === 'IN_PROGRESS'
                                  ? 'primary.main'
                                  : 'text.secondary',
                              fontWeight: 'medium'
                            }}>
                            {getStatusText(item.status)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card sx={{ minHeight: '300px', height: '100%' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
            <Typography
              variant="h6"
              component="div">
              {title}
            </Typography>
            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate(viewAllPath)}>
              전체보기
            </Button>
          </Box>
          <List>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  button
                  onClick={() => handleItemClick(type, item.id)}
                  sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Box
                        component="span"
                        sx={{ display: 'block' }}>
                        {item.title}
                      </Box>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{ display: 'block' }}>
                        {item.date}
                        {item.status && ` - ${item.status}`}
                      </Box>
                    }
                  />
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    )
  }

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
            recentRequests,
            'request',
            '/user/requests'
          )}
        </Grid>
        <Grid
          item
          xs={12}
          md={6}>
          {renderDashboardSection(
            '최근 질문',
            recentQuestions,
            'question',
            '/user/recent-posts'
          )}
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
