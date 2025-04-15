import { useEffect, useState, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Card,
  CardContent,
  ListItemIcon,
  Collapse,
  IconButton
} from '@mui/material'
import {
  ArrowLeft,
  Edit,
  LayoutDashboard,
  Calendar,
  Building2,
  MessageCircle,
  Reply,
  FileText,
  Users,
  ClipboardCheck,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'
import type { Project as ProjectType } from '../../../types/project'
import { useTheme } from '@mui/material/styles'

const Project = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const theme = useTheme()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [project, setProject] = useState<ProjectType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClientMembers, setShowClientMembers] = useState(false)
  const [showDevMembers, setShowDevMembers] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const data = await projectService.getProjectById(parseInt(id))
        setProject(data)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (isLoading) {
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

  if (!project) {
    return <ErrorMessage message="프로젝트가 존재하지 않습니다." />
  }

  const handleDelete = async () => {
    try {
      await projectService.deleteProject(project.id)
      showToast('프로젝트가 성공적으로 삭제되었습니다.', 'success')
      setOpenDeleteDialog(false)
      navigate('/admin/projects')
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error)
      showToast('프로젝트 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/projects')}
            sx={{ color: 'text.primary' }}>
            목록으로
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{ fontWeight: 600, fontSize: '2rem' }}>
              {project.title}
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1.5,
                backgroundColor:
                  project.status === 'IN_PROGRESS'
                    ? '#fff3cd'
                    : project.status === 'DELIVERED'
                      ? '#d4edda'
                      : project.status === 'MAINTENANCE'
                        ? '#cce5ff'
                        : project.status === 'ON_HOLD'
                          ? '#f8d7da'
                          : '#fff3cd', // CONTRACT의 경우
                color:
                  project.status === 'IN_PROGRESS'
                    ? '#856404'
                    : project.status === 'DELIVERED'
                      ? '#155724'
                      : project.status === 'MAINTENANCE'
                        ? '#004085'
                        : project.status === 'ON_HOLD'
                          ? '#721c24'
                          : '#856404', // CONTRACT의 경우
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
              {project.status === 'CONTRACT'
                ? '계약'
                : project.status === 'IN_PROGRESS'
                  ? '진행중'
                  : project.status === 'DELIVERED'
                    ? '납품완료'
                    : project.status === 'MAINTENANCE'
                      ? '하자보수'
                      : project.status === 'ON_HOLD'
                        ? '일시중단'
                        : project.status}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<LayoutDashboard size={20} />}
              onClick={() => navigate(`/user/projects/${id}`)}
              sx={{
                backgroundColor: '#FBBF24',
                '&:hover': {
                  backgroundColor: '#FCD34D'
                },
                color: '#ffffff'
              }}>
              대시보드 바로가기
            </Button>
          </Box>
        </Box>

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
                  <FileText
                    size={36}
                    color="#64748b"
                  />
                  <Stack
                    spacing={1}
                    sx={{ flex: 1 }}>
                    <Box sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      프로젝트 설명
                    </Box>
                    <Box
                      sx={{
                        color: '#334155',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        fontSize: '1rem'
                      }}>
                      {project.description}
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<Edit size={20} />}
                      onClick={() => navigate(`/admin/projects/${id}/edit`)}
                      sx={{
                        backgroundColor: '#F59E0B',
                        '&:hover': {
                          backgroundColor: '#FCD34D'
                        }
                      }}>
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{
                        borderColor: '#ef5350',
                        color: '#ef5350',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: 'transparent'
                        }
                      }}
                      onClick={() => setOpenDeleteDialog(true)}>
                      삭제
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              <Grid
                item
                xs={4}>
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center">
                    <Building2
                      size={36}
                      color="#64748b"
                    />
                    <Stack>
                      <Box
                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        고객사
                      </Box>
                      <Box sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {project.clientCompanyName}
                      </Box>
                    </Stack>
                  </Stack>
                  <Box>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 1 }}>
                      <Users
                        size={24}
                        color="#64748b"
                      />
                      <Box
                        sx={{
                          color: '#64748b',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                        고객사 멤버
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setShowClientMembers(!showClientMembers)}
                        sx={{
                          ml: 'auto',
                          color: '#64748b',
                          '&:hover': { backgroundColor: 'transparent' }
                        }}>
                        {showClientMembers ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </IconButton>
                    </Stack>
                    <Collapse in={showClientMembers}>
                      <List
                        dense
                        disablePadding
                        sx={{ mt: 1 }}>
                        {project.clientCompanyManagers.map((manager, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              px: 0,
                              py: 0.5
                            }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={manager}
                              secondary="담당자"
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: '#334155',
                                  fontSize: '1rem'
                                },
                                '& .MuiListItemText-secondary': {
                                  fontSize: '0.75rem',
                                  color: theme.palette.primary.main
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                        {project.clientCompanyMembers.map((member, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              px: 0,
                              py: 0.5
                            }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color="#64748b"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={member}
                              secondary="일반"
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: '#334155',
                                  fontSize: '1rem'
                                },
                                '& .MuiListItemText-secondary': {
                                  fontSize: '0.75rem',
                                  color: '#64748b'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                </Stack>
              </Grid>

              <Grid
                item
                xs={4}>
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center">
                    <Building2
                      size={36}
                      color="#64748b"
                    />
                    <Stack>
                      <Box
                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        개발사
                      </Box>
                      <Box sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {project.devCompanyName}
                      </Box>
                    </Stack>
                  </Stack>
                  <Box>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 1 }}>
                      <Users
                        size={24}
                        color="#64748b"
                      />
                      <Box
                        sx={{
                          color: '#64748b',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                        개발사 멤버
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setShowDevMembers(!showDevMembers)}
                        sx={{
                          ml: 'auto',
                          color: '#64748b',
                          '&:hover': { backgroundColor: 'transparent' }
                        }}>
                        {showDevMembers ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </IconButton>
                    </Stack>
                    <Collapse in={showDevMembers}>
                      <List
                        dense
                        disablePadding
                        sx={{ mt: 1 }}>
                        {project.devCompanyManagers.map((manager, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              px: 0,
                              py: 0.5
                            }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={manager}
                              secondary="담당자"
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: '#334155',
                                  fontSize: '1rem'
                                },
                                '& .MuiListItemText-secondary': {
                                  fontSize: '0.75rem',
                                  color: theme.palette.primary.main
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                        {project.devCompanyMembers.map((member, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              px: 0,
                              py: 0.5
                            }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color="#64748b"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={member}
                              secondary="일반"
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: '#334155',
                                  fontSize: '1rem'
                                },
                                '& .MuiListItemText-secondary': {
                                  fontSize: '0.75rem',
                                  color: '#64748b'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                </Stack>
              </Grid>

              <Grid
                item
                xs={4}>
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center">
                    <Calendar
                      size={36}
                      color="#64748b"
                    />
                    <Stack>
                      <Box
                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        프로젝트 기간
                      </Box>
                      <Box sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {formatDate(project.startDate)} -{' '}
                        {formatDate(project.endDate)}
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid
          container
          spacing={3}
          sx={{ mb: 4 }}>
          <Grid
            item
            xs={6}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}>
                <ClipboardCheck
                  size={24}
                  color="#64748b"
                />
                <Box sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  최근 승인요청 (더미 데이터)
                </Box>
              </Stack>
              <List>
                {[
                  {
                    id: 1,
                    title: 'UI 디자인 변경 승인요청',
                    content:
                      '메인 페이지 배너 디자인 변경 작업이 완료되었습니다. 변경된 디자인에 대한 승인을 요청드립니다.',
                    date: '2024-03-20',
                    author: '김개발',
                    status: '대기'
                  },
                  {
                    id: 2,
                    title: '프로필 이미지 업로드 기능 개발 완료',
                    content:
                      '사용자 프로필 이미지 업로드 기능 개발이 완료되었습니다. 테스트를 완료했으니 승인 부탁드립니다.',
                    date: '2024-03-19',
                    author: '이개발',
                    status: '승인'
                  },
                  {
                    id: 3,
                    title: '모바일 메뉴 반응형 수정 완료',
                    content:
                      '모바일 환경에서 메뉴가 제대로 표시되지 않는 문제를 수정했습니다. 변경사항에 대한 승인을 요청드립니다.',
                    date: '2024-03-18',
                    author: '박개발',
                    status: '반려'
                  }
                ].map((item, index, array) => (
                  <Fragment key={item.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              fontSize: '0.875rem',
                              color: theme.palette.primary.main,
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}>
                            {item.title}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5
                            }}>
                            <Box
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.4
                              }}>
                              {item.content}
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  alignItems: 'center'
                                }}>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                  }}>
                                  {item.author}
                                </Box>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    opacity: 0.5
                                  }}>
                                  |
                                </Box>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                  }}>
                                  {item.date}
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                {item.status === '승인' && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      backgroundColor: '#dcfce7',
                                      color: '#16a34a',
                                      fontSize: '0.75rem'
                                    }}>
                                    <Reply size={14} />
                                    <Box
                                      sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}>
                                      답변완료
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        }
                        sx={{
                          '& .MuiListItemText-secondary': {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }
                        }}
                      />
                    </ListItem>
                    {index < array.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid
            item
            xs={6}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}>
                <MessageCircle
                  size={24}
                  color="#64748b"
                />
                <Box sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  최근 질문사항 (더미 데이터)
                </Box>
              </Stack>
              <List>
                {[
                  {
                    id: 1,
                    title: 'API 연동 관련 문의',
                    content:
                      '새로 추가된 API 엔드포인트의 인증 방식이 변경되었다고 들었습니다. 자세한 내용을 알려주실 수 있을까요?',
                    date: '2024-03-20',
                    author: '김고객',
                    hasReply: true,
                    comments: 3
                  },
                  {
                    id: 2,
                    title: '데이터베이스 구조 문의',
                    content:
                      '사용자 테이블에 새로운 컬럼을 추가하려고 하는데, 기존 데이터 마이그레이션은 어떻게 진행하면 될까요?',
                    date: '2024-03-19',
                    author: '이고객',
                    hasReply: false,
                    comments: 0
                  },
                  {
                    id: 3,
                    title: '배포 관련 문의',
                    content:
                      '다음 주에 예정된 배포 일정이 변경될 수 있다고 하셨는데, 구체적인 일정을 알려주실 수 있을까요?',
                    date: '2024-03-18',
                    author: '박고객',
                    hasReply: true,
                    comments: 5
                  }
                ].map((item, index, array) => (
                  <Fragment key={item.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              fontSize: '0.875rem',
                              color: theme.palette.primary.main,
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}>
                            {item.title}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5
                            }}>
                            <Box
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.4
                              }}>
                              {item.content}
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  alignItems: 'center'
                                }}>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                  }}>
                                  {item.author}
                                </Box>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    opacity: 0.5
                                  }}>
                                  |
                                </Box>
                                <Box
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                  }}>
                                  {item.date}
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                {item.hasReply && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      backgroundColor: '#dcfce7',
                                      color: '#16a34a',
                                      fontSize: '0.75rem'
                                    }}>
                                    <Reply size={14} />
                                    <Box
                                      sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}>
                                      답변완료
                                    </Box>
                                  </Box>
                                )}
                                {item.comments > 0 && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      backgroundColor: '#f3f4f6',
                                      color: '#4b5563',
                                      fontSize: '0.75rem'
                                    }}>
                                    <MessageCircle size={14} />
                                    <Box
                                      sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}>
                                      {item.comments}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        }
                        sx={{
                          '& .MuiListItemText-secondary': {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }
                        }}
                      />
                    </ListItem>
                    {index < array.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Box>정말로 이 프로젝트를 삭제하시겠습니까?</Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary">
            취소
          </Button>
          <Button
            onClick={handleDelete}
            color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Project
