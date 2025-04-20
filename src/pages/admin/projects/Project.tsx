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
  InputAdornment,
  Chip,
  CircularProgress,
  Checkbox} from '@mui/material'
import { ArrowLeft, Edit, LayoutDashboard, Calendar, Building2, MessageCircle, Reply, FileText, ClipboardCheck, User, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'
import { Project, ProjectMemberResponse, ProjectStatus } from '../../../types/project'
import { useTheme } from '@mui/material/styles'
import { companyService } from '../../../services/companyService'
import useProjectStore from '../../../stores/projectStore'

interface Company {
  id: number
  name: string
  type: 'client' | 'dev'
  phoneNumber?: string
  businessNumber?: string
  address?: string
}

interface SelectedCompany {
  type: 'client' | 'dev'
  id: number
  name: string
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
  // 1. Router and context hooks
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const { showToast } = useToast()
  const { } = useProjectStore()

  // 2. State hooks
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [project, setProject] = useState<Project>({
    id: 0,
    title: '',
    projectName: '',
    name: '',
    description: '',
    status: 'CONTRACT',
    startDate: '',
    endDate: '',
    currentUserProjectRole: '',
    currentUserCompanyRole: '',
    clientCompanyNames: [],
    devCompanyNames: [],
    clientManagerNames: [],
    devManagerNames: [],
    clientMemberNames: [],
    devMemberNames: [],
    clientManagers: [],
    clientMembers: [],
    devManagers: [],
    devMembers: [],
    createdAt: '',
    updatedAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [openMemberDialog, setOpenMemberDialog] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null)
  const [expandedClientManagers, setExpandedClientManagers] = useState<{ [key: number]: boolean }>({})
  const [expandedDevManagers, setExpandedDevManagers] = useState<{ [key: number]: boolean }>({})
  const [expandedClientMembers, setExpandedClientMembers] = useState<{ [key: number]: boolean }>({})
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
  const [selectedCompanyMembers, setSelectedCompanyMembers] = useState<{
    companyId: number;
    companyName: string;
    companyType: 'client' | 'dev';
    members: ProjectMemberResponse[];
  }>({
    companyId: 0,
    companyName: '',
    companyType: 'client',
    members: []
  })
  const [selectedCompanyManagers, setSelectedCompanyManagers] = useState<number[]>([])
  const [selectedRegularMembers, setSelectedRegularMembers] = useState<number[]>([])
  const [clientMembers, setClientMembers] = useState<ProjectMemberResponse[]>([])
  const [devMembers, setDevMembers] = useState<ProjectMemberResponse[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [expandedMemberSections, setExpandedMemberSections] = useState<{ [key: number]: { managers: boolean; members: boolean } }>({})

  // 3. Effect hooks
  useEffect(() => {
    if (id) {
      fetchProjectDetail()
      fetchCompanies()
    }
  }, [id])

  useEffect(() => {
    if (showAddCompanyDialog) {
      fetchCompanies()
    }
  }, [showAddCompanyDialog])

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyMembers()
    }
  }, [selectedCompany])

  useEffect(() => {
    if (id && tabValue !== 0) {
      fetchMembers()
    }
  }, [id, tabValue, openMemberDialog])

  // 4. Helper functions
  const fetchProjectDetail = async () => {
    try {
      setLoading(true)
      const projectData = await projectService.getProjectById(Number(id))
      setProject(projectData)
      setLoading(false)
    } catch (error) {
      console.error('프로젝트 상세 정보 조회 실패:', error)
      setError('프로젝트 상세 정보를 불러오는데 실패했습니다.')
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await companyService.getAllCompanies()
      console.log('회사 목록 API 응답:', response)
      
      // 이미 프로젝트에 포함된 회사 필터링
      const filteredCompanies = response.filter(company => {
        if (companyType === 'client') {
          return !project.clientCompanyNames.some(name => {
            const existingCompany = companies.find(c => c.name === name)
            return existingCompany?.id === company.id
          })
        } else {
          return !project.devCompanyNames.some(name => {
            const existingCompany = companies.find(c => c.name === name)
            return existingCompany?.id === company.id
          })
        }
      })
      
      console.log('필터링된 회사 목록:', filteredCompanies)
      
      const formattedCompanies = filteredCompanies.map(company => ({
        id: company.id,
        name: company.name,
        address: company.address,
        type: companyType
      }))
      
      console.log('포맷팅된 회사 목록:', formattedCompanies)
      setCompanies(formattedCompanies)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
      setCompanies([])
    } finally {
      setLoadingCompanies(false)
    }
  }

  const fetchCompanyMembers = async () => {
    if (!selectedCompany) return
    try {
      setLoadingMembers(true)
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
      showToast('회사 멤버 정보를 불러오는데 실패했습니다.', 'error')
      setCompanyMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const [clientResponse, devResponse] = await Promise.all([
        projectService.getProjectMembers(Number(id), { companyRole: 'CLIENT_COMPANY' }),
        projectService.getProjectMembers(Number(id), { companyRole: 'DEV_COMPANY' })
      ])
      setClientMembers(clientResponse.content)
      setDevMembers(devResponse.content)
    } catch (error) {
      console.error('멤버 조회 실패:', error)
      showToast('멤버 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchNewCompanyMembers = async () => {
    if (!selectedNewCompany) return
    try {
      setLoadingMembers(true)
      
      // 1. 회사의 전체 멤버 목록 가져오기
      const companyMembersResponse = await companyService.getCompanyMembers(selectedNewCompany.id)
      setCompanyMembers(companyMembersResponse.map((member: any) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        phoneNumber: member.phoneNumber,
        email: member.email,
        role: (member.position?.includes('팀장') || member.position?.includes('과장') ? '담당자' : '일반') as '담당자' | '일반'
      })))

      // 2. 현재 프로젝트의 해당 회사 멤버 목록 가져오기
      const projectMembersResponse = await projectService.getProjectMembers(Number(id), {
        companyRole: companyType === 'client' ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
        companyId: selectedNewCompany.id
      })

      // 3. 프로젝트 멤버들을 담당자/일반멤버로 분류
      const projectMembers = projectMembersResponse.content
      const existingManagers = projectMembers
        .filter(member => member.role.includes('MANAGER'))
        .map(member => member.memberId)
      const existingRegularMembers = projectMembers
        .filter(member => !member.role.includes('MANAGER'))
        .map(member => member.memberId)

      // 4. 선택 상태 설정
      setSelectedCompanyMembers({
        companyId: selectedNewCompany.id,
        companyName: selectedNewCompany.name,
        companyType: companyType,
        members: projectMembers
      })

    } catch (error) {
      console.error('멤버 정보 조회 실패:', error)
      showToast('멤버 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoadingMembers(false)
    }
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
      updatedProject.clientManagers = updatedProject.clientManagers.filter(m => m.id !== memberId)
      updatedProject.clientMembers = updatedProject.clientMembers.filter(m => m.id !== memberId)
    } else {
      updatedProject.devManagers = updatedProject.devManagers.filter(m => m.id !== memberId)
      updatedProject.devMembers = updatedProject.devMembers.filter(m => m.id !== memberId)
    }
    setProject(updatedProject)
  }


  const getAvailableManagers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(member =>
      member.role === '담당자' &&
      !project?.clientManagers.some(m => m.id === member.id) &&
      !project?.devManagers.some(m => m.id === member.id)
    )
  }

  const getAvailableRegularMembers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(member =>
      member.role === '일반' &&
      !project?.clientMembers.some(m => m.id === member.id) &&
      !project?.devMembers.some(m => m.id === member.id)
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
      const newMembers = selectedMembers.map(id => {
        const member = companyMembers.find(m => m.id === id)
        return {
          id: member?.id || 0,
          name: member?.name || '',
          companyName: selectedCompany.name
        }
      })

      if (selectedCompany.type === 'client') {
        updatedProject.clientManagers = [...updatedProject.clientManagers, ...newMembers]
      } else {
        updatedProject.devManagers = [...updatedProject.devManagers, ...newMembers]
      }

      await projectService.updateProject(project.id, updatedProject)
      setProject(updatedProject)
      showToast('멤버가 성공적으로 추가되었습니다.', 'success')
      setShowAddMemberDialog(false)
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
      await projectService.updateProjectStatus(project.id, newStatus)
      const updatedProject = {
        ...project,
        status: newStatus
      }
      setProject(updatedProject)
      setExpandedStatus(false)
      showToast('프로젝트 상태가 성공적으로 변경되었습니다.', 'success')
    } catch (error) {
      console.error('프로젝트 상태 업데이트 실패:', error)
      showToast('프로젝트 상태 변경 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleAddNewCompany = async () => {
    if (!selectedNewCompany) return

    try {
      // API 호출 전에 상태 업데이트
      setShowAddCompanyMemberDialog(false)
      setSelectedNewCompany(null)
      setSelectedCompanyMembers({ companyId: 0, companyName: '', companyType: 'client', members: [] })
      setSelectedCompanyManagers([])
      setSelectedRegularMembers([])
      setMemberSearch('')

      // API 호출
      await projectService.addProjectCompany(Number(id), {
        companyId: selectedNewCompany.id,
        role: companyType === 'dev' ? 'DEV_COMPANY' : 'CLIENT_COMPANY',
        managerIds: selectedCompanyManagers,
        memberIds: selectedRegularMembers
      })

      showToast('회사와 멤버가 성공적으로 추가되었습니다.', 'success')
      
      // 멤버 목록 새로고침
      await fetchMembers()
    } catch (error) {
      console.error('회사 및 멤버 추가 실패:', error)
      showToast('회사 및 멤버 추가 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleCompanySelect = async (company: Company) => {
    if (!project) return

    setSelectedCompanyManagers([])
    setSelectedRegularMembers([])
    
    setSelectedNewCompany({
      id: company.id,
      name: company.name
    })

    // 회사 선택 시 바로 멤버 목록을 가져옴
    await fetchNewCompanyMembers()

    setShowAddCompanyDialog(false)
    setShowAddCompanyMemberDialog(true)
  }

  const handleMemberDialogOpen = async (companyId: number, companyName: string, companyType: 'client' | 'dev') => {
    try {
      console.log('멤버 관리 버튼 클릭됨:', { companyId, companyName, companyType })
      setLoadingMembers(true)
      const response = await projectService.getProjectMembers(Number(id), {
        companyRole: companyType === 'client' ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
        companyId: companyId
      })
      console.log('멤버 조회 응답:', response)
      
      setSelectedCompanyMembers({
        companyId,
        companyName,
        companyType,
        members: response.content
      })
      console.log('selectedCompanyMembers 상태 업데이트됨')

      const managers = response.content.filter(member => member.role.includes('MANAGER'))
      setSelectedCompanyManagers(managers.map(member => member.memberId))
      console.log('selectedCompanyManagers 상태 업데이트됨')

      setOpenMemberDialog(true)
      console.log('모달 열기 시도')
    } catch (error) {
      console.error('멤버 조회 실패:', error)
      showToast('멤버 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleMemberDelete = async (memberId: number) => {
    try {
      // 현재 선택된 회사의 멤버 중 담당자 수 확인
      const managers = selectedCompanyMembers.members.filter(member => member.role.includes('MANAGER'))
      
      // 삭제하려는 멤버가 담당자인 경우, 담당자가 한 명이면 삭제 불가
      const memberToDelete = selectedCompanyMembers.members.find(member => member.memberId === memberId)
      if (memberToDelete?.role.includes('MANAGER') && managers.length === 1) {
        showToast('담당자는 최소 한 명 이상이어야 합니다.', 'error')
        return
      }

      await projectService.deleteProjectMember(Number(id), memberId)
      showToast('멤버가 성공적으로 삭제되었습니다.', 'success')
      
      // 멤버 목록 새로고침
      const response = await projectService.getProjectMembers(Number(id), {
        companyRole: tabValue === 1 ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
        companyId: selectedCompanyMembers.companyId
      })
      
      setSelectedCompanyMembers(prev => ({
        ...prev,
        members: response.content
      }))
    } catch (error) {
      console.error('멤버 삭제 실패:', error)
      showToast('멤버 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleAddCompanyMemberDialogOpen = async () => {
    try {
      setLoadingMembers(true)
      
      // 1. 회사의 전체 멤버 목록 가져오기
      const companyMembersResponse = await companyService.getCompanyMembers(selectedCompanyMembers.companyId)
      setCompanyMembers(companyMembersResponse.map((member: any) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        phoneNumber: member.phoneNumber,
        email: member.email,
        role: (member.position?.includes('팀장') || member.position?.includes('과장') ? '담당자' : '일반') as '담당자' | '일반'
      })))

      // 2. 현재 프로젝트의 해당 회사 멤버 목록 가져오기
      const projectMembersResponse = await projectService.getProjectMembers(Number(id), {
        companyRole: selectedCompanyMembers.companyType === 'client' ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
        companyId: selectedCompanyMembers.companyId
      })

      // 3. 프로젝트 멤버들을 담당자/일반멤버로 분류
      const projectMembers = projectMembersResponse.content
      const selectedManagers = projectMembers
        .filter(member => member.role.includes('MANAGER'))
        .map(member => member.memberId)
      const selectedRegularMembers = projectMembers
        .filter(member => !member.role.includes('MANAGER'))
        .map(member => member.memberId)

      // 4. 선택 상태 설정
      setSelectedCompanyManagers(selectedManagers)
      setSelectedRegularMembers(selectedRegularMembers)

      setOpenMemberDialog(false)
      setShowAddCompanyMemberDialog(true)
    } catch (error) {
      console.error('멤버 정보 조회 실패:', error)
      showToast('멤버 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoadingMembers(false)
    }
  }

  // 멤버 선택 모달에서 일반 멤버 선택 처리
  const handleRegularMemberToggle = (memberId: number) => {
    setSelectedRegularMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
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
                            handleStatusChange(status as ProjectStatus)
                            setExpandedStatus(false)
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
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
                                {getStatusText(status as ProjectStatus)}
                              </Typography>
                            }
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
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {project.clientCompanyNames.length > 0 ? (
                          project.clientCompanyNames.map((companyName, index) => (
                            <Chip
                              key={index}
                              label={companyName}
                        size="small"
                        sx={{
                                backgroundColor: '#F3F4F6',
                                color: '#1F2937',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Chip
                            label="고객사 없음"
                            size="small"
                            sx={{
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                              '& .MuiChip-label': {
                                px: 1
                                }
                              }}
                            />
                        )}
                      </Stack>
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
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {project.devCompanyNames.length > 0 ? (
                          project.devCompanyNames.map((companyName, index) => (
                            <Chip
                              key={index}
                              label={companyName}
                        size="small"
                        sx={{
                                backgroundColor: '#F3F4F6',
                                color: '#1F2937',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Chip
                            label="개발사 없음"
                            size="small"
                            sx={{
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                              '& .MuiChip-label': {
                                px: 1
                                }
                              }}
                            />
                        )}
                      </Stack>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                고객사 멤버 관리
              </Typography>
              <Button
                variant="contained"
                startIcon={<Building2 size={20} />}
                onClick={() => {
                  setCompanyType('client')
                  setShowAddCompanyDialog(true)
                }}
                sx={{
                  backgroundColor: '#F59E0B',
                  '&:hover': {
                    backgroundColor: '#FCD34D'
                  }
                }}>
                회사 추가
              </Button>
            </Box>
            <Card>
              {loadingMembers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : clientMembers.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 4,
                  gap: 2
                }}>
                  <Typography variant="body1" color="text.secondary">
                    등록된 고객사가 없습니다.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Building2 size={20} />}
                    onClick={() => setShowAddCompanyDialog(true)}
                    sx={{
                      backgroundColor: '#F59E0B',
                      '&:hover': {
                        backgroundColor: '#FCD34D'
                      }
                    }}>
                    고객사 추가
                  </Button>
                </Box>
              ) : (
                <List>
                  {Array.from(new Set(clientMembers.map(member => member.companyName))).map(companyName => {
                    const company = companies.find(c => c.name === companyName)
                    console.log('회사 정보:', { companyName, company })
                    return (
                      <Box key={companyName}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                  {companyName}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<User size={16} />}
                                  onClick={() => {
                                    console.log('멤버 관리 버튼 클릭:', { companyName, company })
                                    if (company) {
                                      handleMemberDialogOpen(company.id, company.name, 'client')
                                    } else {
                                      console.error('회사 정보를 찾을 수 없음:', companyName)
                                    }
                                  }}
                                  sx={{
                                    borderColor: '#E2E8F0',
                                    color: '#64748B',
                                    '&:hover': {
                                      borderColor: '#94A3B8',
                                      backgroundColor: 'rgba(226, 232, 240, 0.1)'
                                    }
                                  }}>
                                  멤버 관리
                                </Button>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                        {clientMembers
                          .filter(member => member.companyName === companyName)
                          .map(member => (
                            <ListItem key={member.memberId}>
                              <ListItemIcon>
                                <User size={20} color={theme.palette.primary.main} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" component="span" sx={{ color: '#1F2937' }}>
                                      {member.memberName}
                                    </Typography>
                                    <Chip
                                      label={member.role.includes('MANAGER') ? "담당자" : "일반멤버"}
                                      size="small"
                                      sx={{
                                        backgroundColor: member.role.includes('MANAGER') 
                                          ? 'rgba(59, 130, 246, 0.1)' 
                                          : 'rgba(107, 114, 128, 0.1)',
                                        color: member.role.includes('MANAGER') 
                                          ? theme.palette.primary.main 
                                          : '#64748b',
                                        fontWeight: 500,
                                        '& .MuiChip-label': {
                                          px: 1.5,
                                          py: 0.5
                                        }
                                      }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        <Box sx={{ height: 16 }} />
                      </Box>
                    )
                  })}
                </List>
              )}
            </Card>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                개발사 멤버 관리
              </Typography>
              <Button
                variant="contained"
                startIcon={<Building2 size={20} />}
                onClick={() => {
                  setCompanyType('dev')
                  setShowAddCompanyDialog(true)
                }}
                sx={{
                  backgroundColor: '#F59E0B',
                  '&:hover': {
                    backgroundColor: '#FCD34D'
                  }
                }}>
                회사 추가
              </Button>
            </Box>
            <Card>
              {loadingMembers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : devMembers.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 4,
                  gap: 2
                }}>
                  <Typography variant="body1" color="text.secondary">
                    등록된 개발사가 없습니다.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Building2 size={20} />}
                    onClick={() => setShowAddCompanyDialog(true)}
                    sx={{
                      backgroundColor: '#F59E0B',
                      '&:hover': {
                        backgroundColor: '#FCD34D'
                      }
                    }}>
                    개발사 추가
                  </Button>
                </Box>
              ) : (
                <List>
                  {Array.from(new Set(devMembers.map(member => member.companyName))).map(companyName => {
                    const company = companies.find(c => c.name === companyName)
                    return (
                      <Box key={companyName}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                  {companyName}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<User size={16} />}
                                  onClick={() => {
                                    console.log('멤버 관리 버튼 클릭:', { companyName, company })
                                    if (company) {
                                      handleMemberDialogOpen(company.id, company.name, 'dev')
                                    } else {
                                      console.error('회사 정보를 찾을 수 없음:', companyName)
                                    }
                                  }}
                                  sx={{
                                    borderColor: '#E2E8F0',
                                    color: '#64748B',
                                    '&:hover': {
                                      borderColor: '#94A3B8',
                                      backgroundColor: 'rgba(226, 232, 240, 0.1)'
                                    }
                                  }}>
                                  멤버 관리
                                </Button>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                        {devMembers
                          .filter(member => member.companyName === companyName)
                          .map(member => (
                            <ListItem key={member.memberId}>
                              <ListItemIcon>
                                <User size={20} color={theme.palette.primary.main} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" component="span" sx={{ color: '#1F2937' }}>
                                      {member.memberName}
                                    </Typography>
                                    <Chip
                                      label={member.role.includes('MANAGER') ? "담당자" : "일반멤버"}
                                      size="small"
                                      sx={{
                                        backgroundColor: member.role.includes('MANAGER') 
                                          ? 'rgba(59, 130, 246, 0.1)' 
                                          : 'rgba(107, 114, 128, 0.1)',
                                        color: member.role.includes('MANAGER') 
                                          ? theme.palette.primary.main 
                                          : '#64748b',
                                        fontWeight: 500,
                                        '& .MuiChip-label': {
                                          px: 1.5,
                                          py: 0.5
                                        }
                                      }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        <Box sx={{ height: 16 }} />
                      </Box>
                    )
                  })}
                </List>
              )}
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

      {/* Member Management Dialog */}
      <Dialog
        open={openMemberDialog}
        onClose={() => {
          setOpenMemberDialog(false)
          setSelectedCompanyMembers({ companyId: 0, companyName: '', companyType: 'client', members: [] })
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>{selectedCompanyMembers.companyName} 멤버 관리</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddCompanyMemberDialogOpen}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748B',
                '&:hover': {
                  borderColor: '#94A3B8',
                  backgroundColor: 'rgba(226, 232, 240, 0.1)'
                }
              }}>
              수정
            </Button>
    </Box>
        </DialogTitle>
        <DialogContent>
          {loadingMembers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Managers Section */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                    담당자
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setExpandedMemberSections(prev => ({ 
                      ...prev, 
                      [selectedCompanyMembers.companyId]: { 
                        ...prev[selectedCompanyMembers.companyId], 
                        managers: !prev[selectedCompanyMembers.companyId]?.managers 
                      } 
                    }))}
                    sx={{ 
                      color: '#64748b',
                      '&:hover': { backgroundColor: 'transparent' }
                    }}>
                    {expandedMemberSections[selectedCompanyMembers.companyId]?.managers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </IconButton>
                </Stack>
                <Collapse in={expandedMemberSections[selectedCompanyMembers.companyId]?.managers ?? true}>
                  <List>
                    {selectedCompanyMembers.members
                      .filter(member => member.role.includes('MANAGER'))
                      .map(member => (
                        <ListItem 
                          key={member.memberId}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleMemberDelete(member.memberId)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                }
                              }}
                            >
                              <X size={20} />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <User size={20} color={theme.palette.primary.main} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" component="span" sx={{ color: '#1F2937' }}>
                                  {member.memberName}
                                </Typography>
                                <Chip
                                  label={member.role.includes('MANAGER') ? "담당자" : "일반멤버"}
                                  size="small"
                                  sx={{
                                    backgroundColor: member.role.includes('MANAGER') 
                                      ? 'rgba(59, 130, 246, 0.1)' 
                                      : 'rgba(107, 114, 128, 0.1)',
                                    color: member.role.includes('MANAGER') 
                                      ? theme.palette.primary.main 
                                      : '#64748b',
                                    fontWeight: 500,
                                    '& .MuiChip-label': {
                                      px: 1.5,
                                      py: 0.5
                                    }
                                  }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </Box>

              {/* Regular Members Section */}
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
                    일반 멤버
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setExpandedMemberSections(prev => ({ 
                      ...prev, 
                      [selectedCompanyMembers.companyId]: { 
                        ...prev[selectedCompanyMembers.companyId], 
                        members: !prev[selectedCompanyMembers.companyId]?.members 
                      } 
                    }))}
                    sx={{ 
                      color: '#64748b',
                      '&:hover': { backgroundColor: 'transparent' }
                    }}>
                    {expandedMemberSections[selectedCompanyMembers.companyId]?.members ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </IconButton>
                </Stack>
                <Collapse in={expandedMemberSections[selectedCompanyMembers.companyId]?.members ?? true}>
                  <List>
                    {selectedCompanyMembers.members
                      .filter(member => !member.role.includes('MANAGER'))
                      .map(member => (
                        <ListItem 
                          key={member.memberId}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleMemberDelete(member.memberId)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                }
                              }}
                            >
                              <X size={20} />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <User size={20} color={theme.palette.primary.main} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" component="span" sx={{ color: '#1F2937' }}>
                                  {member.memberName}
                                </Typography>
                                <Chip
                                  label={member.role.includes('MANAGER') ? "담당자" : "일반멤버"}
                                  size="small"
                                  sx={{
                                    backgroundColor: member.role.includes('MANAGER') 
                                      ? 'rgba(59, 130, 246, 0.1)' 
                                      : 'rgba(107, 114, 128, 0.1)',
                                    color: member.role.includes('MANAGER') 
                                      ? theme.palette.primary.main 
                                      : '#64748b',
                                    fontWeight: 500,
                                    '& .MuiChip-label': {
                                      px: 1.5,
                                      py: 0.5
                                    }
                                  }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenMemberDialog(false)
            setSelectedCompanyMembers({ companyId: 0, companyName: '', companyType: 'client', members: [] })
          }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog
        open={showAddCompanyDialog}
        onClose={() => {
          setShowAddCompanyDialog(false)
          setSelectedCompany(null)
          setSelectedMembers([])
        }}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>{companyType === 'client' ? '고객사' : '개발사'} 추가</DialogTitle>
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
            {loadingCompanies ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : companies.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography color="text.secondary">추가 가능한 회사가 없습니다.</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                <List sx={{ 
                  '& .MuiListItem-root': { 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }
                }}>
                  {companies
                    .filter(company => 
                      company.name.toLowerCase().includes(companySearch.toLowerCase())
                    )
                    .map(company => (
                      <ListItem
                        key={company.id}
                        button
                        onClick={() => {
                          handleCompanySelect(company)
                        }}
                        sx={{
                          py: 2,
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                              {company.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" component="span">
                              {company.address || '주소 정보 없음'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddCompanyDialog(false)
              setSelectedCompany(null)
              setSelectedMembers([])
            }}>
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
          setSelectedCompanyMembers({ companyId: 0, companyName: '', companyType: 'client', members: [] })
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
                  .map((member) => {
                    // 이미 프로젝트에 속해있는 멤버인지 확인
                    const isExistingMember = selectedCompanyMembers.members.some(
                      existingMember => existingMember.memberId === member.id
                    );

                    return (
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
                            <User size={20} color={theme.palette.primary.main} />
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
                              if (selectedRegularMembers.includes(member.id)) {
                                setSelectedRegularMembers(prev => prev.filter(id => id !== member.id))
                              }
                              setSelectedCompanyManagers(prev => 
                                prev.includes(Number(member.id))
                                  ? isExistingMember 
                                    ? prev // 이미 프로젝트에 속한 멤버는 선택 해제 불가
                                    : prev.filter(id => id !== Number(member.id))
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
                            color={selectedRegularMembers.includes(member.id) ? "primary" : "inherit"}
                            onClick={() => {
                              if (selectedCompanyManagers.includes(Number(member.id))) {
                                setSelectedCompanyManagers(prev => prev.filter(id => id !== Number(member.id)))
                              }
                              if (isExistingMember) {
                                // 이미 프로젝트에 속한 멤버는 선택 해제 불가
                                if (!selectedRegularMembers.includes(member.id)) {
                                  handleRegularMemberToggle(member.id)
                                }
                              } else {
                                handleRegularMemberToggle(member.id)
                              }
                            }}
                            sx={{
                              minWidth: 80,
                              borderColor: selectedRegularMembers.includes(member.id) ? theme.palette.primary.main : '#e2e8f0',
                              color: selectedRegularMembers.includes(member.id) ? theme.palette.primary.main : '#64748b',
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
                    );
                  })}
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
                  onClick={() => setExpandedMemberSections(prev => ({ 
                    ...prev, 
                    [selectedNewCompany?.id || 0]: { 
                      ...prev[selectedNewCompany?.id || 0], 
                      managers: !prev[selectedNewCompany?.id || 0]?.managers 
                    } 
                  }))}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}>
                  {expandedMemberSections[selectedNewCompany?.id || 0]?.managers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Stack>
              <Collapse in={expandedMemberSections[selectedNewCompany?.id || 0]?.managers ?? true}>
                <List>
                  {selectedCompanyManagers.map(managerId => {
                    const manager = companyMembers.find(m => m.id === managerId)
                    const isExistingMember = selectedCompanyMembers.members.some(
                      existingMember => existingMember.memberId === managerId
                    )
                    return manager ? (
                      <ListItem key={managerId}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <User size={20} color={theme.palette.primary.main} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" component="span">
                                {manager.name}
                              </Typography>
                              <Chip
                                label="담당자"
                                size="small"
                                sx={{
                                  backgroundColor: '#F3F4F6',
                                  color: theme.palette.primary.main,
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Box>
                          }
                        />
                        {!isExistingMember && (
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
                        )}
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
                  onClick={() => setExpandedMemberSections(prev => ({ 
                    ...prev, 
                    [selectedNewCompany?.id || 0]: { 
                      ...prev[selectedNewCompany?.id || 0], 
                      members: !prev[selectedNewCompany?.id || 0]?.members 
                    } 
                  }))}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}>
                  {expandedMemberSections[selectedNewCompany?.id || 0]?.members ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Stack>
              <Collapse in={expandedMemberSections[selectedNewCompany?.id || 0]?.members ?? true}>
                <List>
                  {companyMembers
                    .filter(member => selectedRegularMembers.includes(member.id))
                    .map(member => {
                      const isExistingMember = selectedCompanyMembers.members.some(
                        existingMember => existingMember.memberId === member.id
                      )
                      return (
                        <ListItem key={member.id}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <User size={20} color={theme.palette.primary.main} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" component="span">
                                  {member.name}
                                </Typography>
                                <Chip
                                  label="일반멤버"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#F3F4F6',
                                    color: theme.palette.primary.main,
                                    '& .MuiChip-label': {
                                      px: 1
                                    }
                                  }}
                                />
                              </Box>
                            }
                          />
                          {!isExistingMember && (
                            <IconButton
                              edge="end"
                              onClick={() => handleRegularMemberToggle(member.id)}
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                }
                              }}>
                              <X size={20} />
                            </IconButton>
                          )}
                        </ListItem>
                      )
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
              setSelectedCompanyMembers({ companyId: 0, companyName: '', companyType: 'client', members: [] })
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
            disabled={selectedCompanyManagers.length === 0 && selectedCompanyMembers.members.length === 0}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectDetail
