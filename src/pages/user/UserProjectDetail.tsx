import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  ArrowBack as ArrowLeft,
  Description as FileText,
  Business as Building2,
  CalendarToday as Calendar,
  Assignment as ClipboardCheck,
  QuestionAnswer as MessageSquare,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'
import type { Project } from '../../types/project'
import dayjs from 'dayjs'

const UserProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchProjectDetail()
    checkAdminStatus()
  }, [id])

  const fetchProjectDetail = async () => {
    try {
      setLoading(true)
      const projectData = await projectService.getProjectById(Number(id))
      setProject(projectData)
    } catch (err) {
      console.error('프로젝트 상세 정보 조회 실패:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : '프로젝트 상세 정보를 불러오는데 실패했습니다.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const userRole = await projectService.getUserRole()
      setIsAdmin(userRole === 'ADMIN')
    } catch (err) {
      console.error('사용자 권한 확인 실패:', err)
      setIsAdmin(false)
    }
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
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
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!project) {
    return (
      <Box p={2}>
        <Alert severity="error">프로젝트가 존재하지 않습니다.</Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            width: '100%'
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowLeft />}
              onClick={() => navigate('/user')}
              sx={{ color: 'text.primary' }}>
              목록으로
            </Button>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600 }}>
              {project.title}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettings(true)}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
              minWidth: '100px',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}>
            설정
          </Button>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <Typography variant="h6">프로젝트 설정</Typography>
            <IconButton
              onClick={() => setOpenSettings(false)}
              sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {isAdmin ? (
              <>
                <ListItem
                  button
                  onClick={() => {
                    setOpenSettings(false)
                    navigate(`/admin/projects/${id}/edit`)
                  }}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="프로젝트 전체 정보 수정" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    setOpenSettings(false)
                    navigate(`/user/projects/${id}/stages`)
                  }}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="프로젝트 단계 관리" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    setOpenSettings(false)
                    // 삭제 로직 추가
                  }}>
                  <ListItemIcon>
                    <DeleteIcon />
                  </ListItemIcon>
                  <ListItemText primary="프로젝트 삭제" />
                </ListItem>
              </>
            ) : (
              <ListItem
                button
                onClick={() => {
                  setOpenSettings(false)
                  navigate(`/user/projects/${id}/stages`)
                }}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="프로젝트 단계 관리" />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid
            container
            spacing={4}>
            <Grid
              item
              xs={12}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start">
                <FileText sx={{ fontSize: 36, color: '#64748b' }} />
                <Stack
                  spacing={1}
                  sx={{ flex: 1 }}>
                  <Typography
                    color="text.secondary"
                    variant="caption">
                    프로젝트 설명
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#334155',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}>
                    {project.description}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center">
                  <Building2 sx={{ fontSize: 36, color: '#64748b' }} />
                  <Stack>
                    <Typography
                      color="text.secondary"
                      variant="caption">
                      고객사
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap>
                      {project.clientCompanyNames.length > 0 ? (
                        project.clientCompanyNames.map((companyName, index) => (
                          <Typography
                            key={index}
                            variant="body1">
                            {companyName}
                          </Typography>
                        ))
                      ) : (
                        <Typography
                          variant="body1"
                          color="text.secondary">
                          고객사 없음
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center">
                  <Building2 sx={{ fontSize: 36, color: '#64748b' }} />
                  <Stack>
                    <Typography
                      color="text.secondary"
                      variant="caption">
                      개발사
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap>
                      {project.devCompanyNames.length > 0 ? (
                        project.devCompanyNames.map((companyName, index) => (
                          <Typography
                            key={index}
                            variant="body1">
                            {companyName}
                          </Typography>
                        ))
                      ) : (
                        <Typography
                          variant="body1"
                          color="text.secondary">
                          개발사 없음
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center">
                  <Calendar sx={{ fontSize: 36, color: '#64748b' }} />
                  <Stack>
                    <Typography
                      color="text.secondary"
                      variant="caption">
                      프로젝트 기간
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      {formatDate(project.startDate)} -{' '}
                      {formatDate(project.endDate)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid
        container
        spacing={3}>
        <Grid
          item
          xs={12}
          md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}>
              <ClipboardCheck sx={{ fontSize: 24, color: '#64748b' }} />
              <Typography variant="h6">최근 승인요청</Typography>
            </Stack>
            <Stack spacing={2}>
              {[
                {
                  id: 1,
                  title: 'UI 디자인 변경 승인요청',
                  content:
                    '메인 페이지 배너 디자인 변경 작업이 완료되었습니다.',
                  date: '2024-03-20',
                  author: '김개발',
                  status: '대기'
                },
                {
                  id: 2,
                  title: '프로필 이미지 업로드 기능 개발 완료',
                  content:
                    '사용자 프로필 이미지 업로드 기능 개발이 완료되었습니다.',
                  date: '2024-03-19',
                  author: '이개발',
                  status: '승인'
                }
              ].map(request => (
                <Card
                  key={request.id}
                  variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium">
                        {request.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary">
                        {request.content}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}>
                        <Typography variant="caption">
                          {request.author}
                        </Typography>
                        <Divider
                          orientation="vertical"
                          flexItem
                        />
                        <Typography variant="caption">
                          {request.date}
                        </Typography>
                        <Divider
                          orientation="vertical"
                          flexItem
                        />
                        <Typography variant="caption">
                          {request.status}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}>
              <MessageSquare sx={{ fontSize: 24, color: '#64748b' }} />
              <Typography variant="h6">최근 질문</Typography>
            </Stack>
            <Stack spacing={2}>
              {[
                {
                  id: 1,
                  title: 'API 엔드포인트 관련 문의',
                  content:
                    '사용자 목록 조회 API의 파라미터에 대해 문의드립니다.',
                  date: '2024-03-20',
                  author: '김고객'
                },
                {
                  id: 2,
                  title: '디자인 가이드 관련',
                  content:
                    '새로운 디자인 가이드 적용 시점에 대해 문의드립니다.',
                  date: '2024-03-19',
                  author: '이고객'
                }
              ].map(question => (
                <Card
                  key={question.id}
                  variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium">
                        {question.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary">
                        {question.content}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}>
                        <Typography variant="caption">
                          {question.author}
                        </Typography>
                        <Divider
                          orientation="vertical"
                          flexItem
                        />
                        <Typography variant="caption">
                          {question.date}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserProjectDetail
