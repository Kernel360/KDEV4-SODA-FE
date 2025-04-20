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
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment} from '@mui/material'
import { ArrowLeft, Edit, LayoutDashboard, Calendar, Building2, MessageCircle, Reply, FileText, ClipboardCheck, User, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'
import type { ProjectStatus } from '../../../types/project'
import { useTheme } from '@mui/material/styles'
import { companyService } from '../../../services/companyService'
import useProjectStore from '../../../stores/projectStore'
import type { Project } from '../../../types/project'

interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string | null
  businessNumber: string | null
  address: string | null
  isActive: boolean
  type: 'client' | 'dev'
}

interface SelectedCompany {
  type: 'client' | 'dev'
  id: number
  name: string
}

interface TempProject extends Omit<Project, 'clientCompanyManagers' | 'devCompanyManagers' | 'devCompanyMembers' | 'clientCompanyMembers' | 'clientCompanyIds' | 'devCompanyId'> {
  clientCompanyManagers: number[]
  devCompanyManagers: number[]
  devCompanyMembers: number[]
  clientCompanyMembers: number[]
  clientCompanyIds: number[]
  devCompanyId: number
  projectName: string
}


interface CompanyMember {
  id: number
  name: string
  position?: string
  phoneNumber?: string
  email?: string
  role: '담당자' | '일반'
}

// 상태 변환 함수들
const getStatusText = (status: ProjectStatus): string => {
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

const getStatusValue = (status: string): ProjectStatus => {
  switch (status) {
    case '계약':
      return 'CONTRACT'
    case '진행중':
      return 'IN_PROGRESS'
    case '납품완료':
      return 'DELIVERED'
    case '하자보수':
      return 'MAINTENANCE'
    case '일시중단':
      return 'ON_HOLD'
    default:
      return 'CONTRACT'
  }
}


const ProjectDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [project, setProject] = useState<Project>({
    id: 0,
    projectName: '',
    title: '',
    description: '',
    clientCompanyName: '',
    devCompanyName: '',
    status: 'CONTRACT',
    startDate: '',
    endDate: '',
    clientCompanyIds: [],
    devCompanyId: 0,
    clientCompanyManagers: [],
    clientCompanyMembers: [],
    devCompanyManagers: [],
    devCompanyMembers: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const [tabValue, setTabValue] = useState(0)
  const [openMemberDialog, setOpenMemberDialog] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null)
  const [expandedClientManagers, setExpandedClientManagers] = useState<{ [key: number]: boolean }>({})
  const [expandedDevManagers, setExpandedDevManagers] = useState<{ [key: number]: boolean }>({})
  const [expandedDevMembers, setExpandedDevMembers] = useState<{ [key: number]: boolean }>({})
  const [memberSearch, setMemberSearch] = useState('')
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [expandedStatus, setExpandedStatus] = useState(false)
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [showAddCompanyMemberDialog, setShowAddCompanyMemberDialog] = useState(false)
  const [selectedNewCompany, setSelectedNewCompany] = useState<{
    id: number
    name: string
  } | null>(null)
  const [companySearch, setCompanySearch] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [companyType, setCompanyType] = useState<'client' | 'dev'>('client')
  const [selectedCompanyMembers, setSelectedCompanyMembers] = useState<number[]>([])
  const [selectedCompanyManagers, setSelectedCompanyManagers] = useState<number[]>([])

  const TEMP_PROJECTS: TempProject[] = [
    {
      id: 1,
      projectName: '프로젝트 1',
      title: '프로젝트 1',
      description: '프로젝트 1 설명',
      clientCompanyName: '고객사 1',
      devCompanyName: '개발사 1',
      status: 'IN_PROGRESS',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientCompanyIds: [1],
      devCompanyId: 1,
      clientCompanyManagers: [],
      devCompanyManagers: [],
      devCompanyMembers: [],
      clientCompanyMembers: []
    },
    {
      id: 2,
      projectName: '프로젝트 2',
      title: '프로젝트 2',
      description: '프로젝트 2 설명',
      clientCompanyName: '고객사 2',
      devCompanyName: '개발사 2',
      status: 'CONTRACT',
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      clientCompanyIds: [2],
      devCompanyId: 2,
      clientCompanyManagers: [],
      devCompanyManagers: [],
      devCompanyMembers: [],
      clientCompanyMembers: []
    },
    {
      id: 3,
      projectName: '프로젝트 3',
      title: '프로젝트 3',
      description: '프로젝트 3 설명',
      clientCompanyName: '고객사 3',
      devCompanyName: '개발사 3',
      status: 'DELIVERED',
      startDate: '2024-03-01',
      endDate: '2024-10-31',
      clientCompanyIds: [3],
      devCompanyId: 3,
      clientCompanyManagers: [],
      devCompanyManagers: [],
      devCompanyMembers: [],
      clientCompanyMembers: []
    },
    {
      id: 4,
      projectName: '프로젝트 4',
      title: '프로젝트 4',
      description: '프로젝트 4 설명',
      clientCompanyName: '고객사 4',
      devCompanyName: '개발사 4',
      status: 'MAINTENANCE',
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      clientCompanyIds: [4],
      devCompanyId: 4,
      clientCompanyManagers: [],
      devCompanyManagers: [],
      devCompanyMembers: [],
      clientCompanyMembers: []
    },
    {
      id: 5,
      projectName: '프로젝트 5',
      title: '프로젝트 5',
      description: '프로젝트 5 설명',
      clientCompanyName: '고객사 5',
      devCompanyName: '개발사 5',
      status: 'ON_HOLD',
      startDate: '2024-05-01',
      endDate: '2024-08-31',
      clientCompanyIds: [5],
      devCompanyId: 5,
      clientCompanyManagers: [],
      devCompanyManagers: [],
      devCompanyMembers: [],
      clientCompanyMembers: []
    }
  ]

  const { } = useProjectStore()

  const convertTempProjectToProject = (tempProject: TempProject): Project => {
    return {
      ...tempProject,
      clientCompanyIds: tempProject.clientCompanyIds || [],
      devCompanyId: tempProject.devCompanyId,
      clientCompanyManagers: tempProject.clientCompanyManagers.map(id => Number(id)),
      devCompanyManagers: tempProject.devCompanyManagers.map(id => Number(id)),
      devCompanyMembers: tempProject.devCompanyMembers.map(id => Number(id)),
      clientCompanyMembers: tempProject.clientCompanyMembers.map(id => Number(id))
    }
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // 임시 데이터 먼저 사용
        const tempProject = TEMP_PROJECTS.find(p => p.id === Number(id))
        if (tempProject) {
          setProject(convertTempProjectToProject(tempProject))
          setLoading(false)
          return
        }

        // 임시 데이터가 없으면 API 호출
        const data = await projectService.getProjectById(Number(id))
        setProject(data as Project)
      } catch (error) {
        console.error('프로젝트 데이터를 불러오는데 실패했습니다:', error)
        // API 호출 실패 시에도 임시 데이터 사용
        const tempProject = TEMP_PROJECTS.find(p => p.id === Number(id))
        if (tempProject) {
          setProject(convertTempProjectToProject(tempProject))
        } else {
          setError('프로젝트를 찾을 수 없습니다.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  useEffect(() => {
    const fetchCompanyMembers = async () => {
      if (!selectedCompany) return
      try {
        const response = await companyService.getCompanyMembers(selectedCompany.id)
        const members: CompanyMember[] = response.map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.position,
          phoneNumber: member.phoneNumber,
          email: member.email,
          role: (member.position?.includes('팀장') || member.position?.includes('과장') ? '담당자' : '일반') as '담당자' | '일반'
        }))
        setCompanyMembers(members)
      } catch (error) {
        console.error('Failed to fetch company members:', error)
        setCompanyMembers([])
      }
    }
    fetchCompanyMembers()
  }, [selectedCompany])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies()
        // API 응답을 필요한 형식으로 변환
        const formattedCompanies = response.map(company => ({
          ...company,
          type: (company.name.includes('고객사') ? 'client' : 'dev') as 'client' | 'dev'
        }))
        setCompanies(formattedCompanies)
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        setCompanies([])
      }
    }
    fetchCompanies()
  }, [])

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMemberRemove = (memberId: number, isClient: boolean) => {
    if (!project) return

    const updatedProject = { ...project }
    if (isClient) {
      updatedProject.clientCompanyManagers = updatedProject.clientCompanyManagers
        .filter(id => id !== memberId)
      updatedProject.clientCompanyMembers = updatedProject.clientCompanyMembers
        .filter(id => id !== memberId)
    } else {
      updatedProject.devCompanyManagers = updatedProject.devCompanyManagers
        .filter(id => id !== memberId)
      updatedProject.devCompanyMembers = updatedProject.devCompanyMembers
        .filter(id => id !== memberId)
    }
    setProject(updatedProject)
  }


  const getAvailableManagers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(member =>
      member.role === '담당자' &&
      !project?.clientCompanyManagers.includes(member.id) &&
      !project?.devCompanyManagers.includes(member.id)
    )
  }

  const getAvailableRegularMembers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(member =>
      member.role === '일반' &&
      !project?.clientCompanyMembers.includes(member.id) &&
      !project?.devCompanyMembers.includes(member.id)
    )
  }

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleMemberAddition = async () => {
    try {
      if (!project || !selectedCompany) return
      
      const updatedProject = { ...project }
      if (selectedCompany.type === 'client') {
        updatedProject.clientCompanyManagers = [...updatedProject.clientCompanyManagers, ...selectedMembers.map(Number)]
      } else {
        updatedProject.devCompanyManagers = [...updatedProject.devCompanyManagers, ...selectedMembers.map(Number)]
      }

      await projectService.updateProject(project.id, updatedProject)
      setProject(updatedProject)
      showToast('멤버가 성공적으로 추가되었습니다.', 'success')
      setOpenMemberDialog(false)
      setSelectedCompany(null)
      setSelectedMembers([])
    } catch (error) {
      console.error('멤버 추가 중 오류:', error)
      showToast('멤버 추가 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return

    try {
      const updatedProject: Project = {
        ...project,
        status: getStatusValue(newStatus)
      }
      setProject(updatedProject)
      setExpandedStatus(false)
    } catch (error) {
      console.error('프로젝트 상태 업데이트 실패:', error)
    }
  }

  const handleAddNewCompany = () => {
    if (!selectedNewCompany) return

    const company: Company = {
      id: selectedNewCompany.id,
      name: selectedNewCompany.name,
      ceoName: '',
      phoneNumber: null,
      businessNumber: null,
      address: null,
      isActive: true,
      type: companyType
    }

    setCompanies(prev => [...prev, company])
    setShowAddCompanyDialog(false)
    setSelectedNewCompany(null)
  }

  const handleCompanySelect = (company: Company) => {
    if (!project) return

    const selectedCompany: SelectedCompany = {
      type: company.type,
      id: company.id,
      name: company.name
    }

    const updatedProject = { ...project }
    if (selectedCompany.type === 'client') {
      updatedProject.clientCompanyIds = [company.id]
    } else {
      updatedProject.devCompanyId = company.id
    }
    setSelectedCompany(selectedCompany)
    setProject(updatedProject)
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
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                상태:
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <Button
                  variant="outlined"
                  onClick={() => setExpandedStatus(!expandedStatus)}
              sx={{
                    minWidth: 120,
                    justifyContent: 'space-between',
                    textTransform: 'none',
                    color: 'text.primary',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {getStatusText(project.status)}
                  {expandedStatus ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                {expandedStatus && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1,
                      mt: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {['CONTRACT', 'IN_PROGRESS', 'DELIVERED', 'MAINTENANCE', 'ON_HOLD'].map((status) => (
                        <ListItem
                          key={status}
                          button
                          onClick={() => {
                            handleStatusChange(getStatusValue(status))
                            setExpandedStatus(false)
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemText
                            primary={getStatusText(getStatusValue(status))}
                            sx={{
                              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
                                color: status === project.status ? 'primary.main' : 'text.primary'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
        </Box>
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="프로젝트 정보" />
            <Tab label="고객사 멤버 관리" />
            <Tab label="개발사 멤버 관리" />
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ bgcolor: 'white', minHeight: '500px' }}>
        {tabValue === 0 && (
          <Box>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <FileText size={36} color="#64748b" />
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Typography color="text.secondary" variant="caption">프로젝트 설명</Typography>
                    <Typography variant="body1" sx={{ 
                        color: '#334155',
                        lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                      }}>
                      {project.description}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
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

                  <Grid item xs={6}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Building2 size={36} color="#64748b" />
                    <Stack>
                      <Typography color="text.secondary" variant="caption">고객사</Typography>
                          <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>ABC 주식회사</Typography>
                    </Stack>
                  </Stack>
                </Stack>
          </Grid>

                  <Grid item xs={6}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Building2 size={36} color="#64748b" />
                    <Stack>
                      <Typography color="text.secondary" variant="caption">개발사</Typography>
                          <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>XYZ 주식회사</Typography>
                    </Stack>
                  </Stack>
                </Stack>
          </Grid>

                  <Grid item xs={12}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Calendar size={36} color="#64748b" />
                    <Stack>
                      <Typography color="text.secondary" variant="caption">프로젝트 기간</Typography>
                      <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>{formatDate(project.startDate)} - {formatDate(project.endDate)}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <ClipboardCheck size={24} color="#64748b" />
                <Typography variant="h6">최근 승인요청 (더미 데이터)</Typography>
              </Stack>
              <List>
                {[
                  {
                    id: 1,
                    title: 'UI 디자인 변경 승인요청',
                    content: '메인 페이지 배너 디자인 변경 작업이 완료되었습니다. 변경된 디자인에 대한 승인을 요청드립니다.',
                    date: '2024-03-20',
                    author: '김개발',
                    status: '대기'
                  },
                  {
                    id: 2,
                    title: '프로필 이미지 업로드 기능 개발 완료',
                    content: '사용자 프로필 이미지 업로드 기능 개발이 완료되었습니다. 테스트를 완료했으니 승인 부탁드립니다.',
                    date: '2024-03-19',
                    author: '이개발',
                    status: '승인'
                  },
                  {
                    id: 3,
                    title: '모바일 메뉴 반응형 수정 완료',
                    content: '모바일 환경에서 메뉴가 제대로 표시되지 않는 문제를 수정했습니다. 변경사항에 대한 승인을 요청드립니다.',
                    date: '2024-03-18',
                    author: '박개발',
                    status: '반려'
                  }
                ].map((item, index, array) => (
                  <Fragment key={item.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ 
                              fontSize: '0.875rem',
                              color: theme.palette.primary.main,
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}>
                            {item.title}
              </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                              {item.content}
              </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.author}
              </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
                                  |
              </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.date}
              </Typography>
                                </Box>
                              <Typography variant="caption" sx={{ 
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                backgroundColor: item.status === '승인' ? '#dcfce7' : item.status === '반려' ? '#fee2e2' : '#f3f4f6',
                                color: item.status === '승인' ? '#16a34a' : item.status === '반려' ? '#dc2626' : '#4b5563',
                                      fontSize: '0.75rem'
                                    }}>
                                {item.status}
                              </Typography>
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
                    {index < array.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <MessageCircle size={24} color="#64748b" />
                <Typography variant="h6">최근 질문사항 (더미 데이터)</Typography>
              </Stack>
              <List>
                {[
                  {
                    id: 1,
                    title: 'API 연동 관련 문의',
                    content: '새로 추가된 API 엔드포인트의 인증 방식이 변경되었다고 들었습니다. 자세한 내용을 알려주실 수 있을까요?',
                    date: '2024-03-20',
                    author: '김고객',
                    hasReply: true,
                    comments: 3
                  },
                  {
                    id: 2,
                    title: '데이터베이스 구조 문의',
                    content: '사용자 테이블에 새로운 컬럼을 추가하려고 하는데, 기존 데이터 마이그레이션은 어떻게 진행하면 될까요?',
                    date: '2024-03-19',
                    author: '이고객',
                    hasReply: false,
                    comments: 0
                  },
                  {
                    id: 3,
                    title: '배포 관련 문의',
                    content: '다음 주에 예정된 배포 일정이 변경될 수 있다고 하셨는데, 구체적인 일정을 알려주실 수 있을까요?',
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
                          <Typography sx={{ 
                              fontSize: '0.875rem',
                              color: theme.palette.primary.main,
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}>
                            {item.title}
              </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                              {item.content}
              </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.author}
              </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
                                  |
              </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.date}
              </Typography>
                                </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.hasReply && (
                                  <Box sx={{ 
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
                                    <Typography variant="caption">답변완료</Typography>
                                  </Box>
                                )}
                                {item.comments > 0 && (
                                  <Box sx={{ 
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
                                    <Typography variant="caption">{item.comments}</Typography>
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
                    {index < array.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              고객사 멤버 관리
              </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">
                    고객사 목록
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      setCompanyType('client')
                      setShowAddCompanyDialog(true)
                      setCompanySearch('')
                    }}
                  >
                    회사 추가
                  </Button>
                </Box>
                <List>
                  {companies.map((company) => (
                    <Box key={company.id}>
                      <ListItem>
                        <ListItemText
                          primary={company.name}
                          secondary={`담당자: ${company.ceoName}`}
                        />
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => {
                            handleCompanySelect(company)
                            setOpenMemberDialog(true)
                          }}
                        >
                          멤버 관리
                        </Button>
                  </ListItem>
                      <Box sx={{ pl: 4, pr: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, mt: 2 }}>
                          <Typography variant="subtitle1">
                            담당자 목록
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setExpandedClientManagers(prev => ({ ...prev, [company.id]: !prev[company.id] }))}
                            sx={{ 
                              color: '#64748b',
                              '&:hover': { backgroundColor: 'transparent' }
                            }}>
                            {expandedClientManagers[company.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </IconButton>
                        </Stack>
                        <Collapse in={expandedClientManagers[company.id]}>
                          <List>
                            {company.ceoName && (
                              <ListItem>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <User size={20} color={theme.palette.primary.main} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={company.ceoName}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      color: '#334155',
                                      fontSize: '1rem'
                                    }
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Collapse>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                ))}
              </List>
              </CardContent>
            </Card>
            </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              개발사 멤버 관리
              </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">
                    개발사 목록
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      setCompanyType('dev')
                      setShowAddCompanyDialog(true)
                      setCompanySearch('')
                    }}
                  >
                    회사 추가
                  </Button>
                </Box>
                <List>
                  {companies.map((company) => (
                    <Box key={company.id}>
                      <ListItem>
                        <ListItemText
                          primary={company.name}
                          secondary={`담당자: ${company.ceoName}`}
                        />
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => {
                            handleCompanySelect(company)
                            setOpenMemberDialog(true)
                          }}
                        >
                          멤버 관리
                        </Button>
                  </ListItem>
                      <Box sx={{ pl: 4, pr: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, mt: 2 }}>
                          <Typography variant="subtitle1">
                            담당자 목록
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setExpandedDevManagers(prev => ({ ...prev, [company.id]: !prev[company.id] }))}
                            sx={{ 
                              color: '#64748b',
                              '&:hover': { backgroundColor: 'transparent' }
                            }}>
                            {expandedDevManagers[company.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </IconButton>
                        </Stack>
                        <Collapse in={expandedDevManagers[company.id]}>
                          <List>
                            {company.ceoName && (
                              <ListItem>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <User size={20} color={theme.palette.primary.main} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={company.ceoName}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      color: '#334155',
                                      fontSize: '1rem'
                                    }
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Collapse>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                ))}
              </List>
              </CardContent>
            </Card>
            </Box>
        )}
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 프로젝트를 삭제하시겠습니까?</Typography>
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

      <Dialog
        open={openMemberDialog}
        onClose={() => {
          setOpenMemberDialog(false)
          setSelectedCompany(null)
          setSelectedMembers([])
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedCompany?.name} 멤버 관리
          <IconButton
            onClick={() => {
              setOpenMemberDialog(false)
              setSelectedCompany(null)
              setSelectedMembers([])
            }}
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <List>
              {selectedCompany && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                      담당자
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddManagerDialog(true)}
                    >
                      담당자 추가
                    </Button>
    </Box>
                  {companyMembers
                    .filter(member => member.role === '담당자')
                    .map((member) => (
                      <ListItem key={member.id}>
                        <ListItemIcon>
                          <User size={20} color={theme.palette.primary.main} />
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={member.position}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleMemberRemove(Number(member.id), selectedCompany.type === 'client')}
                          color="error"
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          <X size={20} />
                        </IconButton>
                      </ListItem>
                    ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
                      일반 멤버
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddMemberDialog(true)}
                    >
                      일반 멤버 추가
                    </Button>
                  </Box>
                  {companyMembers
                    .filter(member => member.role === '일반')
                    .map((member) => (
                      <ListItem key={member.id}>
                        <ListItemIcon>
                          <User size={20} color="#64748b" />
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={member.position}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleMemberRemove(Number(member.id), selectedCompany.type === 'client')}
                          color="error"
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          <X size={20} />
                        </IconButton>
                      </ListItem>
                    ))}
                </>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenMemberDialog(false)
              setSelectedCompany(null)
              setSelectedMembers([])
            }}
          >
            확인
          </Button>
        </DialogActions>

        {/* Add Manager Dialog */}
        <Dialog
          open={showAddManagerDialog}
          onClose={() => {
            setShowAddManagerDialog(false)
            setSelectedMembers([])
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            담당자 추가
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="담당자 검색"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <List>
                {getAvailableManagers()
                  .filter(member => 
                    member.name.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((member) => (
                    <ListItem
                      key={member.id}
                      button
                      onClick={() => handleMemberToggle(Number(member.id))}
                      selected={selectedMembers.includes(Number(member.id))}
                    >
                      <ListItemIcon>
                        <User size={20} color={selectedMembers.includes(Number(member.id)) ? theme.palette.primary.main : '#64748b'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={member.name}
                        secondary={member.position}
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setShowAddManagerDialog(false)
                setSelectedMembers([])
              }}
            >
              취소
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                handleMemberAddition()
                setShowAddManagerDialog(false)
              }}
              disabled={selectedMembers.length === 0}
            >
              추가
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog
          open={showAddMemberDialog}
          onClose={() => {
            setShowAddMemberDialog(false)
            setSelectedMembers([])
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            일반 멤버 추가
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="일반 멤버 검색"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <List>
                {getAvailableRegularMembers()
                  .filter(member => 
                    member.name.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((member) => (
                    <ListItem
                      key={member.id}
                      button
                      onClick={() => handleMemberToggle(Number(member.id))}
                      selected={selectedMembers.includes(Number(member.id))}
                    >
                      <ListItemIcon>
                        <User size={20} color={selectedMembers.includes(Number(member.id)) ? theme.palette.primary.main : '#64748b'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={member.name}
                        secondary={member.position}
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setShowAddMemberDialog(false)
                setSelectedMembers([])
              }}
            >
              취소
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                handleMemberAddition()
                setShowAddMemberDialog(false)
              }}
              disabled={selectedMembers.length === 0}
            >
              추가
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog
        open={showAddCompanyDialog}
        onClose={() => {
          setShowAddCompanyDialog(false)
          setCompanySearch('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          회사 추가
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="회사 검색"
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <List>
              {companies
                .filter(company => 
                  company.name.toLowerCase().includes(companySearch.toLowerCase())
                )
                .map((company) => (
                  <ListItem
                    key={company.id}
                    button
                    onClick={() => {
                      setSelectedNewCompany(company)
                      setShowAddCompanyDialog(false)
                      setShowAddCompanyMemberDialog(true)
                    }}
                  >
                    <ListItemText
                      primary={company.name}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: '#334155',
                          fontSize: '1rem'
                        }
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowAddCompanyDialog(false)
              setCompanySearch('')
            }}
          >
            취소
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Company Member Dialog */}
      <Dialog
        open={showAddCompanyMemberDialog}
        onClose={() => {
          setShowAddCompanyMemberDialog(false)
          setSelectedNewCompany(null)
          setSelectedCompanyMembers([])
          setSelectedCompanyManagers([])
          setMemberSearch('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedNewCompany?.name} 멤버 선택
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="멤버 검색"
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              <List>
                {companyMembers
                  .filter(member => 
                    member.name.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((member) => (
                    <ListItem
                      key={member.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <User size={20} color="#64748b" />
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={member.position}
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
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color={selectedCompanyManagers.includes(Number(member.id)) ? "primary" : "inherit"}
                          onClick={() => {
                            if (selectedCompanyMembers.includes(Number(member.id))) {
                              setSelectedCompanyMembers(prev => prev.filter(id => id !== Number(member.id)))
                            }
                            setSelectedCompanyManagers(prev => 
                              prev.includes(Number(member.id))
                                ? prev.filter(id => id !== Number(member.id))
                                : [...prev, Number(member.id)]
                            )
                          }}
                          sx={{
                            minWidth: 80,
                            borderColor: selectedCompanyManagers.includes(Number(member.id)) ? theme.palette.primary.main : '#e2e8f0',
                            color: selectedCompanyManagers.includes(Number(member.id)) ? theme.palette.primary.main : '#64748b',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: 'rgba(59, 130, 246, 0.04)'
                            }
                          }}
                        >
                          담당자
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color={selectedCompanyMembers.includes(Number(member.id)) ? "primary" : "inherit"}
                          onClick={() => {
                            if (selectedCompanyManagers.includes(Number(member.id))) {
                              setSelectedCompanyManagers(prev => prev.filter(id => id !== Number(member.id)))
                            }
                            setSelectedCompanyMembers(prev => 
                              prev.includes(Number(member.id))
                                ? prev.filter(id => id !== Number(member.id))
                                : [...prev, Number(member.id)]
                            )
                          }}
                          sx={{
                            minWidth: 80,
                            borderColor: selectedCompanyMembers.includes(Number(member.id)) ? theme.palette.primary.main : '#e2e8f0',
                            color: selectedCompanyMembers.includes(Number(member.id)) ? theme.palette.primary.main : '#64748b',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: 'rgba(59, 130, 246, 0.04)'
                            }
                          }}
                        >
                          일반멤버
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Box>

            {/* Selected Members Section */}
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                  선택된 담당자
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setExpandedDevManagers(prev => ({ ...prev, [selectedNewCompany?.id || 0]: !prev[selectedNewCompany?.id || 0] }))}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}>
                  {expandedDevManagers[selectedNewCompany?.id || 0] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Stack>
              <Collapse in={expandedDevManagers[selectedNewCompany?.id || 0]}>
                <List>
                  {selectedCompanyManagers.map(managerId => {
                    const manager = companyMembers.find(m => m.id === managerId)
                    return manager ? (
                      <ListItem key={managerId}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <User size={20} color={theme.palette.primary.main} />
                        </ListItemIcon>
                        <ListItemText
                          primary={manager.name}
                          secondary={manager.position}
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
                        <IconButton
                          edge="end"
                          onClick={() => setSelectedCompanyManagers(prev => prev.filter(id => id !== managerId))}
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          <X size={20} />
                        </IconButton>
                      </ListItem>
                    ) : null
                  })}
                </List>
              </Collapse>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
                  선택된 일반 멤버
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setExpandedDevMembers(prev => ({ ...prev, [selectedNewCompany?.id || 0]: !prev[selectedNewCompany?.id || 0] }))}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}>
                  {expandedDevMembers[selectedNewCompany?.id || 0] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Stack>
              <Collapse in={expandedDevMembers[selectedNewCompany?.id || 0]}>
                <List>
                  {selectedCompanyMembers.map(memberId => {
                    const member = companyMembers.find(m => m.id === memberId)
                    return member ? (
                      <ListItem key={memberId}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <User size={20} color="#64748b" />
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={member.position}
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
                        <IconButton
                          edge="end"
                          onClick={() => setSelectedCompanyMembers(prev => prev.filter(id => id !== memberId))}
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          <X size={20} />
                        </IconButton>
                      </ListItem>
                    ) : null
                  })}
                </List>
              </Collapse>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowAddCompanyMemberDialog(false)
              setSelectedNewCompany(null)
              setSelectedCompanyMembers([])
              setSelectedCompanyManagers([])
              setMemberSearch('')
            }}
          >
            취소
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddNewCompany}
            disabled={selectedCompanyManagers.length === 0 && selectedCompanyMembers.length === 0}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectDetail
