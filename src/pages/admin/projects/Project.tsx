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
  Checkbox
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
  ClipboardCheck,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  X
} from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'
import {
  Project,
  ProjectMemberResponse,
  ProjectStatus
} from '../../../types/project'
import { useTheme } from '@mui/material/styles'
import { companyService } from '../../../services/companyService'
import useProjectStore from '../../../stores/projectStore'
import dayjs from 'dayjs'

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

const getArticleStatusText = (status: string): string => {
  switch (status) {
    case 'COMMENTED':
      return '답변완료'
    case 'PENDING':
      return '답변대기'
    default:
      return status
  }
}

const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return '낮음'
    case 'MEDIUM':
      return '중간'
    case 'HIGH':
      return '높음'
    default:
      return priority
  }
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return '#22C55E' // Green
    case 'MEDIUM':
      return '#F59E0B' // Yellow
    case 'HIGH':
      return '#EF4444' // Red
    default:
      return '#64748B' // Gray
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
  const {} = useProjectStore()

  // 2. State hooks
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [project, setProject] = useState<Project>({
    id: 0,
    projectId: 0,
    title: '',
    projectName: '',
    name: '',
    description: '',
    status: 'CONTRACT',
    startDate: '',
    endDate: '',
    currentUserProjectRole: '',
    currentUserCompanyRole: '',
    companyProjectRole: null,
    memberProjectRole: null,
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
    updatedAt: '',
    stages: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [openMemberDialog, setOpenMemberDialog] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number
    name: string
    type: 'client' | 'dev'
  } | null>(null)
  const [expandedClientManagers, setExpandedClientManagers] = useState<{
    [key: number]: boolean
  }>({})
  const [expandedDevManagers, setExpandedDevManagers] = useState<{
    [key: number]: boolean
  }>({})
  const [expandedClientMembers, setExpandedClientMembers] = useState<{
    [key: number]: boolean
  }>({})
  const [expandedDevMembers, setExpandedDevMembers] = useState<{
    [key: number]: boolean
  }>({})
  const [memberSearch, setMemberSearch] = useState('')
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [expandedStatus, setExpandedStatus] = useState(false)
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [showAddCompanyMemberDialog, setShowAddCompanyMemberDialog] =
    useState(false)
  const [selectedNewCompany, setSelectedNewCompany] = useState<{
    id: number
    name: string
  } | null>(null)
  const [companySearch, setCompanySearch] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([])
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [companyType, setCompanyType] = useState<'client' | 'dev'>('client')
  const [selectedCompanyMembers, setSelectedCompanyMembers] = useState<{
    companyId: number
    companyName: string
    companyType: 'client' | 'dev'
    members: ProjectMemberResponse[]
  }>({
    companyId: 0,
    companyName: '',
    companyType: 'client',
    members: []
  })
  const [selectedCompanyManagers, setSelectedCompanyManagers] = useState<
    number[]
  >([])
  const [selectedRegularMembers, setSelectedRegularMembers] = useState<
    number[]
  >([])
  const [clientMembers, setClientMembers] = useState<ProjectMemberResponse[]>(
    []
  )
  const [devMembers, setDevMembers] = useState<ProjectMemberResponse[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [expandedMemberSections, setExpandedMemberSections] = useState<{
    [key: number]: { managers: boolean; members: boolean }
  }>({})
  const [articles, setArticles] = useState<any[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [showDeleteMemberDialog, setShowDeleteMemberDialog] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
  const [showDeleteCompanyDialog, setShowDeleteCompanyDialog] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<{
    id: number
    name: string
    type: 'client' | 'dev'
  } | null>(null)
  const [showAddDevCompanyDialog, setShowAddDevCompanyDialog] = useState(false)
  const [showAddClientCompanyDialog, setShowAddClientCompanyDialog] =
    useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // 3. Effect hooks
  useEffect(() => {
    if (id) {
      fetchProjectDetail()
      fetchCompanies()
      fetchArticles()
      fetchRequests()
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

  useEffect(() => {
    if (selectedNewCompany) {
      fetchNewCompanyMembers()
    }
  }, [selectedNewCompany])

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

      // 모든 회사 정보 저장
      const allCompanies = response.map(company => ({
        id: company.id,
        name: company.name,
        address: company.address,
        type: companyType
      }))
      setCompanies(allCompanies)

      // 추가 가능한 회사만 필터링
      const filteredCompanies = response.filter(company => {
        // 이미 프로젝트에 할당된 회사인지 확인
        const isAssigned =
          project.clientCompanyNames.some(name => {
            const existingCompany = allCompanies.find(c => c.name === name)
            return existingCompany?.id === company.id
          }) ||
          project.devCompanyNames.some(name => {
            const existingCompany = allCompanies.find(c => c.name === name)
            return existingCompany?.id === company.id
          })

        // 개발사 추가 시 이미 고객사로 등록된 회사는 제외
        if (companyType === 'dev') {
          const isClientCompany = project.clientCompanyNames.some(name => {
            const existingCompany = allCompanies.find(c => c.name === name)
            return existingCompany?.id === company.id
          })
          if (isClientCompany) return false
        }

        return !isAssigned
      })

      const formattedCompanies = filteredCompanies.map(company => ({
        id: company.id,
        name: company.name,
        address: company.address,
        type: companyType // companyType 유지
      }))

      setAvailableCompanies(formattedCompanies)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
      setAvailableCompanies([])
      } finally {
      setLoadingCompanies(false)
    }
  }

  const fetchCompanyMembers = async () => {
    if (!selectedCompany) return
    try {
      setLoadingMembers(true)
      const response = await companyService.getCompanyMembers(
        selectedCompany.id
      )
      const members: CompanyMember[] = response.map((member: any) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        phoneNumber: member.phoneNumber,
        email: member.email,
        role: (member.position?.includes('팀장') ||
        member.position?.includes('과장')
          ? '담당자'
          : '일반') as '담당자' | '일반'
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
        projectService.getProjectMembers(Number(id), {
          companyRole: 'CLIENT_COMPANY'
        }),
        projectService.getProjectMembers(Number(id), {
          companyRole: 'DEV_COMPANY'
        })
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
      const companyMembersResponse = await companyService.getCompanyMembers(
        selectedNewCompany.id
      )
      setCompanyMembers(
        companyMembersResponse.map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.position,
          phoneNumber: member.phoneNumber,
          email: member.email,
          role: (member.position?.includes('팀장') ||
          member.position?.includes('과장')
            ? '담당자'
            : '일반') as '담당자' | '일반'
        }))
      )

      // 2. 현재 프로젝트의 해당 회사 멤버 목록 가져오기
      const projectMembersResponse = await projectService.getProjectMembers(
        Number(id),
        {
          companyRole:
            companyType === 'client' ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
          companyId: selectedNewCompany.id
        }
      )

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

  const fetchArticles = async () => {
    try {
      setLoadingArticles(true)
      const response = await projectService.getProjectArticles(
        Number(id),
        null,
        undefined,
        undefined,
        0,
        3
      )
      setArticles(response.data.content)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const response = await projectService.getProjectRequests(Number(id))
      // Get only the first 3 requests
      setRequests((response.data?.content || []).slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      showToast('승인 요청 목록을 불러오는데 실패했습니다.', 'error')
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  const getRequestStatusText = (status: string): string => {
    switch (status) {
      case 'APPROVED':
        return '승인됨'
      case 'APPROVING':
        return '승인중'
      case 'PENDING':
        return '대기중'
      case 'REJECTED':
        return '거절됨'
      default:
        return status
    }
  }

  const getRequestStatusColor = (
    status: string
  ): { bgColor: string; textColor: string } => {
    switch (status) {
      case 'APPROVED':
        return { bgColor: '#dcfce7', textColor: '#16a34a' }
      case 'APPROVING':
        return { bgColor: '#fef3c7', textColor: '#d97706' }
      case 'PENDING':
        return { bgColor: '#f3f4f6', textColor: '#4b5563' }
      case 'REJECTED':
        return { bgColor: '#fee2e2', textColor: '#dc2626' }
      default:
        return { bgColor: '#f3f4f6', textColor: '#4b5563' }
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
      updatedProject.clientManagers = updatedProject.clientManagers.filter(
        m => m.id !== memberId
      )
      updatedProject.clientMembers = updatedProject.clientMembers.filter(
        m => m.id !== memberId
      )
    } else {
      updatedProject.devManagers = updatedProject.devManagers.filter(
        m => m.id !== memberId
      )
      updatedProject.devMembers = updatedProject.devMembers.filter(
        m => m.id !== memberId
      )
    }
    setProject(updatedProject)
  }

  const getAvailableManagers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(
      member =>
        member.role === '담당자' &&
        !project?.clientManagers.some(m => m.id === member.id) &&
        !project?.devManagers.some(m => m.id === member.id)
    )
  }

  const getAvailableRegularMembers = () => {
    if (!selectedCompany) return []
    return companyMembers.filter(
      member =>
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
        updatedProject.clientManagers = [
          ...updatedProject.clientManagers,
          ...newMembers
        ]
      } else {
        updatedProject.devManagers = [
          ...updatedProject.devManagers,
          ...newMembers
        ]
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

  const handleCompanySelect = (company: Company) => {
    console.log('회사 선택:', { company, companyType })
    setSelectedNewCompany({
      id: company.id,
      name: company.name
    })
    // companyType을 유지
    setShowAddCompanyDialog(false)
    setShowAddCompanyMemberDialog(true)
  }

  const handleAddNewCompany = async () => {
    if (!selectedNewCompany) return

    try {
      await projectService.addProjectCompany(Number(id), {
        companyId: selectedNewCompany.id,
        role: companyType === 'dev' ? 'DEV_COMPANY' : 'CLIENT_COMPANY',
        managerIds: selectedCompanyManagers,
        memberIds: selectedRegularMembers
      })

      showToast(
        `${companyType === 'dev' ? '개발사' : '고객사'}가 추가되었습니다`,
        'success'
      )
      await fetchProjectDetail()
      await fetchMembers()
      setShowAddClientCompanyDialog(false)
      setSelectedNewCompany(null)
      setSelectedCompanyManagers([])
      setSelectedRegularMembers([])
      setMemberSearch('')
    } catch (error) {
      console.error('회사 추가 실패:', error)
      showToast('회사 추가에 실패했습니다', 'error')
    }
  }

  const handleMemberDialogOpen = async (
    companyId: number,
    companyName: string,
    companyType: 'client' | 'dev'
  ) => {
    try {
      console.log('멤버 관리 버튼 클릭됨:', {
        companyId,
        companyName,
        companyType
      })
      setLoadingMembers(true)
      const response = await projectService.getProjectMembers(Number(id), {
        companyRole:
          companyType === 'client' ? 'CLIENT_COMPANY' : 'DEV_COMPANY',
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

      const managers = response.content.filter(member =>
        member.role.includes('MANAGER')
      )
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
    setMemberToDelete(memberId)
    setShowDeleteMemberDialog(true)
  }

  const confirmMemberDelete = async () => {
    if (!memberToDelete) return

    try {
      await projectService.deleteProjectMember(Number(id), memberToDelete)
      showToast('멤버가 성공적으로 삭제되었습니다.', 'success')

      // 멤버 목록 새로고침
      const response = await projectService.getProjectMembers(Number(id), {
        companyRole:
          selectedCompanyMembers.companyType === 'client'
            ? 'CLIENT_COMPANY'
            : 'DEV_COMPANY',
        companyId: selectedCompanyMembers.companyId
      })

      setSelectedCompanyMembers(prev => ({
        ...prev,
        members: response.content
      }))

      // 프로젝트 멤버 목록도 새로고침
      await fetchMembers()
    } catch (error) {
      console.error('멤버 삭제 실패:', error)
      showToast('멤버 삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      setShowDeleteMemberDialog(false)
      setMemberToDelete(null)
    }
  }

  const handleAddCompanyMemberDialogOpen = async () => {
    try {
      setLoadingMembers(true)

      // 1. 회사의 전체 멤버 목록 가져오기
      const companyMembersResponse = await companyService.getCompanyMembers(
        selectedCompanyMembers.companyId
      )
      setCompanyMembers(
        companyMembersResponse.map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.position,
          phoneNumber: member.phoneNumber,
          email: member.email,
          role: (member.position?.includes('팀장') ||
          member.position?.includes('과장')
            ? '담당자'
            : '일반') as '담당자' | '일반'
        }))
      )

      // 2. 현재 프로젝트의 해당 회사 멤버 목록 가져오기
      const projectMembersResponse = await projectService.getProjectMembers(
        Number(id),
        {
          companyRole:
            selectedCompanyMembers.companyType === 'client'
              ? 'CLIENT_COMPANY'
              : 'DEV_COMPANY',
          companyId: selectedCompanyMembers.companyId
        }
      )

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

  const handleAddNewMembers = async () => {
    try {
      // 기존 멤버 id와 role 매핑
      const existingMembersMap = new Map(
        selectedCompanyMembers.members.map(m => [m.memberId, m.role])
      )

      // 선택된 담당자/일반멤버를 모두 합침
      const allSelected = [
        ...selectedCompanyManagers.map(id => ({ id, role: 'MANAGER' })),
        ...selectedRegularMembers.map(id => ({ id, role: 'MEMBER' }))
      ]

      // 변경/추가 대상 찾기
      const changedOrNew = allSelected.filter(sel => {
        const prevRole = existingMembersMap.get(sel.id)
        if (!prevRole) return true // 새 멤버
        // 역할이 바뀐 경우
        if (
          (sel.role === 'MANAGER' && !prevRole.includes('MANAGER')) ||
          (sel.role === 'MEMBER' && prevRole.includes('MANAGER'))
        ) {
          return true
        }
        return false
      })

      if (changedOrNew.length === 0) {
        showToast('추가/변경할 멤버가 없습니다.', 'info')
        return
      }

      const companyIdToUse =
        selectedCompanyMembers.companyId || selectedNewCompany?.id || 0
      if (!companyIdToUse) {
        showToast('회사를 먼저 선택해주세요.', 'error')
        return
      }

      const response = await projectService.addProjectMembers(Number(id), {
        companyId: companyIdToUse,
        managerIds: selectedCompanyManagers,
        memberIds: selectedRegularMembers
      })

      if (response.status === 'success') {
        showToast('멤버가 성공적으로 추가/변경되었습니다.', 'success')
        // 모달 닫기 및 상태 초기화
        setShowAddCompanyMemberDialog(false)
        setSelectedNewCompany(null)
        setSelectedCompanyManagers([])
        setSelectedRegularMembers([])
        setMemberSearch('')
        // 멤버 목록 새로고침
        await fetchMembers()
        // 선택된 회사 멤버 목록도 새로고침
        const updatedMembers = await projectService.getProjectMembers(
          Number(id),
          {
            companyRole:
              selectedCompanyMembers.companyType === 'client'
                ? 'CLIENT_COMPANY'
                : 'DEV_COMPANY',
            companyId: companyIdToUse
          }
        )
        setSelectedCompanyMembers(prev => ({
          ...prev,
          members: updatedMembers.content,
          companyId: companyIdToUse
        }))
      } else {
        throw new Error('멤버 추가/변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('멤버 추가/변경 실패:', error)
      showToast('멤버 추가/변경 중 오류가 발생했습니다.', 'error')
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

  const handleCompanyDelete = async () => {
    if (!companyToDelete || !id) return

    try {
      await projectService.deleteProjectCompany(Number(id), companyToDelete.id)
      showToast('회사가 성공적으로 삭제되었습니다.', 'success')

      // 프로젝트 정보 새로고침
      await fetchProjectDetail()
      // 멤버 목록 새로고침
      await fetchMembers()
    } catch (error) {
      console.error('회사 삭제 실패:', error)
      showToast('회사 삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      setShowDeleteCompanyDialog(false)
      setCompanyToDelete(null)
    }
  }

  // 개발사 추가 버튼 클릭 핸들러 (개발사가 없을 때 표시되는 버튼)
  const handleDevCompanyAddClick = () => {
    setCompanyType('dev')
    setShowAddDevCompanyDialog(true)
  }

  // 고객사/개발사 탭의 상단 추가 버튼 클릭 핸들러
  const handleCompanyAddClick = (type: 'client' | 'dev') => {
    setCompanyType(type)
    setShowAddClientCompanyDialog(true)
  }

  const handleDevCompanySelect = (company: Company) => {
    setSelectedNewCompany({
      id: company.id,
      name: company.name
    })
    setShowAddDevCompanyDialog(false)
    setShowAddCompanyMemberDialog(true)
  }

  const handleAddDevCompany = async () => {
    if (!selectedNewCompany) return

    try {
      const response = await projectService.addProjectDevCompanies(Number(id), {
        devAssignments: [
          {
            companyId: selectedNewCompany.id,
            managerIds: selectedCompanyManagers,
            memberIds: selectedRegularMembers
          }
        ]
      })

      if (response.status === 'success') {
        showToast('개발사가 추가되었습니다', 'success')
        await projectService.updateProjectStatus(Number(id), 'IN_PROGRESS')
        await fetchProjectDetail()
        await fetchMembers()
        setShowAddCompanyMemberDialog(false)
        setSelectedNewCompany(null)
        setSelectedCompanyManagers([])
        setSelectedRegularMembers([])
        setMemberSearch('')
      }
    } catch (error) {
      console.error('개발사 추가 실패:', error)
      showToast('개발사 추가에 실패했습니다', 'error')
    }
  }

  // Fetch the list of company names already associated with the project
  const associatedCompanyNames = [
    ...project.clientCompanyNames,
    ...project.devCompanyNames
  ]

  // Filter available companies to exclude those already associated with the project
  const filteredAvailableCompanies = availableCompanies.filter(
    company => !associatedCompanyNames.includes(company.name)
  )

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
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                color="text.secondary">
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
                  }}>
                  {getStatusText(project.status)}
                  {expandedStatus ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
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
                    }}>
                    <List sx={{ p: 0 }}>
                      {[
                        'CONTRACT',
                        'IN_PROGRESS',
                        'DELIVERED',
                        'MAINTENANCE',
                        'ON_HOLD'
                      ].map(status => (
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
                          }}>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
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
          <Tabs
            value={tabValue}
            onChange={handleTabChange}>
            <Tab label="프로젝트 정보" />
            <Tab label="고객사 멤버 관리" />
            <Tab label="개발사 멤버 관리" />
          </Tabs>
        </Box>

        <Box sx={{ bgcolor: 'white', minHeight: '500px' }}>
          {tabValue === 0 && (
            <Box>
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
                        <Stack
                          direction="row"
                          spacing={1}>
          <Button
            variant="contained"
            startIcon={<Edit size={20} />}
                            onClick={() =>
                              navigate(`/admin/projects/${id}/edit`)
                            }
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
                      xs={6}>
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
                                project.clientCompanyNames.map(
                                  (companyName, index) => (
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
                                  )
                                )
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

        <Grid
                      item
                      xs={6}>
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
                                project.devCompanyNames.map(
                                  (companyName, index) => (
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
                                  )
                                )
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

          <Grid
            item
                      xs={12}>
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
              <Typography
                color="text.secondary"
                              variant="caption">
                              프로젝트 기간
              </Typography>
              <Typography
                variant="body1"
                              sx={{ fontSize: '1rem', fontWeight: 500 }}>
                              {dayjs(project.startDate).format(
                                'YYYY년 M월 D일'
                              )}{' '}
                              -{' '}
                              {dayjs(project.endDate).format('YYYY년 M월 D일')}
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
                spacing={3}
                sx={{ mb: 4 }}>
                <Grid
                  item
                  xs={6}>
                  <Paper sx={{ p: 3, minHeight: '300px' }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 3 }}>
                      <ClipboardCheck
                        size={24}
                        color="#64748b"
                      />
                      <Typography variant="h6">최근 승인요청</Typography>
                    </Stack>
                    {loadingRequests ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '200px'
                        }}>
                        <CircularProgress />
                      </Box>
                    ) : requests.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '200px'
                        }}>
                        <Typography color="text.secondary">
                          등록된 요청이 없습니다.
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {requests.map((request, index, array) => {
                          const statusColors = getRequestStatusColor(
                            request.status
                          )
                          return (
                            <Fragment key={request.requestId}>
                              <ListItem sx={{ px: 0, py: 2 }}>
                                <ListItemText
                                  primary={
              <Typography
                                      onClick={() =>
                                        navigate(
                                          `/user/projects/${id}/requests/${request.requestId}`
                                        )
                                      }
                                      sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }}>
                                      {request.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5
                                      }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'text.secondary',
                                          lineHeight: 1.4,
                                          fontSize: '0.875rem'
                                        }}>
                                        {request.content}
                                      </Typography>
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
                                          <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            {request.memberName}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                color="text.secondary"
                                            sx={{ opacity: 0.5 }}>
                                            |
              </Typography>
              <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            {formatDate(request.createdAt)}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor:
                                              statusColors.bgColor,
                                            color: statusColors.textColor,
                                            fontSize: '0.75rem'
                                          }}>
                                          {getRequestStatusText(request.status)}
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
                          )
                        })}
                      </List>
                    )}
                  </Paper>
                </Grid>
                <Grid
                  item
                  xs={6}>
                  <Paper sx={{ p: 3, minHeight: '300px' }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                sx={{ mb: 3 }}>
                      <MessageCircle
                        size={24}
                        color="#64748b"
                      />
                      <Typography variant="h6">최근 질문사항</Typography>
                    </Stack>
                    {loadingArticles ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '200px'
                        }}>
                        <CircularProgress />
                      </Box>
                    ) : articles.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '200px'
                        }}>
                        <Typography color="text.secondary">
                          등록된 질문사항이 없습니다.
              </Typography>
                      </Box>
                    ) : (
                      <List>
                        {articles.map((article, index, array) => (
                          <Fragment key={article.id}>
                            <ListItem sx={{ px: 0, py: 2 }}>
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
              <Typography
                                      sx={{
                                        fontSize: '0.875rem',
                                        color: theme.palette.primary.main,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }}
                                      onClick={() =>
                                        navigate(
                                          `/user/projects/${id}/articles/${article.id}`
                                        )
                                      }>
                                      {article.title}
                                    </Typography>
                                    <Chip
                                      label={getPriorityText(article.priority)}
                                      size="small"
                                      sx={{
                                        backgroundColor: `${getPriorityColor(article.priority)}20`,
                                        color: getPriorityColor(
                                          article.priority
                                        ),
                                        fontSize: '0.75rem',
                                        height: '20px',
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
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
                                        <Typography
                                          variant="caption"
                                          color="text.secondary">
                                          {article.userName}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                color="text.secondary"
                                          sx={{ opacity: 0.5 }}>
                                          |
              </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary">
                                          {formatDate(article.createdAt)}
                                        </Typography>
                                      </Box>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1
                                        }}>
                                        <Chip
                                          label={getArticleStatusText(
                                            article.status
                                          )}
                                          size="small"
                                          sx={{
                                            backgroundColor:
                                              article.status === 'COMMENTED'
                                                ? '#F3F4F6'
                                                : '#FEF2F2',
                                            color:
                                              article.status === 'COMMENTED'
                                                ? '#4B5563'
                                                : '#DC2626',
                                            fontSize: '0.75rem',
                                            height: '20px',
                                            '& .MuiChip-label': {
                                              px: 1
                                            }
                                          }}
                                        />
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
                                            마감: {formatDate(article.endDate)}
                                          </Typography>
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
                    )}
                  </Paper>
          </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                <Typography variant="h6">고객사 멤버 관리</Typography>
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
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      gap: 2
                    }}>
              <Typography
                      variant="body1"
                      color="text.secondary">
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
                    {Array.from(
                      new Set(clientMembers.map(member => member.companyName))
                    ).map(companyName => {
                      const company = companies.find(
                        c => c.name === companyName
                      )
                      console.log('회사 정보:', { companyName, company })
                      return (
                        <Box key={companyName}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                  <Typography
                                    variant="subtitle1"
                                    component="span"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: theme.palette.primary.main
                                    }}>
                                    {companyName}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<User size={16} />}
                                      onClick={() => {
                                        console.log('멤버 관리 버튼 클릭:', {
                                          companyName,
                                          company
                                        })
                                        if (company) {
                                          handleMemberDialogOpen(
                                            company.id,
                                            company.name,
                                            'client'
                                          )
                                        } else {
                                          console.error(
                                            '회사 정보를 찾을 수 없음:',
                                            companyName
                                          )
                                        }
                                      }}
                                      sx={{
                                        borderColor: '#E2E8F0',
                                        color: '#64748B',
                                        '&:hover': {
                                          borderColor: '#94A3B8',
                                          backgroundColor:
                                            'rgba(226, 232, 240, 0.1)'
                                        }
                                      }}>
                                      멤버 관리
                                    </Button>
                                    {project.clientCompanyNames.length > 1 && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<X size={16} />}
                                        onClick={() => {
                                          if (company) {
                                            setCompanyToDelete({
                                              id: company.id,
                                              name: company.name,
                                              type: 'client'
                                            })
                                            setShowDeleteCompanyDialog(true)
                                          }
                                        }}
                                        sx={{
                                          borderColor: '#EF4444',
                                          color: '#EF4444',
                                          '&:hover': {
                                            borderColor: '#DC2626',
                                            backgroundColor:
                                              'rgba(239, 68, 68, 0.1)'
                                          }
                                        }}>
                                        회사 삭제
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider />
                          {clientMembers
                            .filter(
                              member => member.companyName === companyName
                            )
                            .map(member => (
                              <ListItem key={member.memberId}>
                                <ListItemIcon>
                                  <User
                                    size={20}
                                    color={theme.palette.primary.main}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}>
              <Typography
                variant="body1"
                                        component="span"
                                        sx={{ color: '#1F2937' }}>
                                        {member.memberName}
              </Typography>
                                      <Chip
                                        label={
                                          member.role.includes('MANAGER')
                                            ? '담당자'
                                            : '일반멤버'
                                        }
                                        size="small"
                                        sx={{
                                          backgroundColor: member.role.includes(
                                            'MANAGER'
                                          )
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                <Typography variant="h6">개발사 멤버 관리</Typography>
                {devMembers.length === 0 ? (
                  <Button
                    variant="contained"
                    startIcon={<Building2 size={20} />}
                    onClick={handleDevCompanyAddClick}
                    sx={{
                      backgroundColor: '#F59E0B',
                      '&:hover': {
                        backgroundColor: '#FCD34D'
                      }
                    }}>
                    개발사 추가
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Building2 size={20} />}
                    onClick={() => handleCompanyAddClick('dev')}
                    sx={{
                      backgroundColor: '#F59E0B',
                      '&:hover': {
                        backgroundColor: '#FCD34D'
                      }
                    }}>
                    회사 추가
                  </Button>
                )}
              </Box>
              <Card>
                {loadingMembers ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : devMembers.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      gap: 2
                    }}>
              <Typography
                      variant="body1"
                      color="text.secondary">
                      등록된 개발사가 없습니다.
              </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Building2 size={20} />}
                      onClick={handleDevCompanyAddClick}
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
                    {Array.from(
                      new Set(devMembers.map(member => member.companyName))
                    ).map(companyName => {
                      const company = companies.find(
                        c => c.name === companyName
                      )
                      return (
                        <Box key={companyName}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                  <Typography
                                    variant="subtitle1"
                                    component="span"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: theme.palette.primary.main
                                    }}>
                                    {companyName}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<User size={16} />}
                                      onClick={() => {
                                        console.log('멤버 관리 버튼 클릭:', {
                                          companyName,
                                          company
                                        })
                                        if (company) {
                                          handleMemberDialogOpen(
                                            company.id,
                                            company.name,
                                            'dev'
                                          )
                                        } else {
                                          console.error(
                                            '회사 정보를 찾을 수 없음:',
                                            companyName
                                          )
                                        }
                                      }}
                                      sx={{
                                        borderColor: '#E2E8F0',
                                        color: '#64748B',
                                        '&:hover': {
                                          borderColor: '#94A3B8',
                                          backgroundColor:
                                            'rgba(226, 232, 240, 0.1)'
                                        }
                                      }}>
                                      멤버 관리
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<X size={16} />}
                                      onClick={() => {
                                        if (company) {
                                          setCompanyToDelete({
                                            id: company.id,
                                            name: company.name,
                                            type: 'dev'
                                          })
                                          setShowDeleteCompanyDialog(true)
                                        }
                                      }}
                                      sx={{
                                        borderColor: '#EF4444',
                                        color: '#EF4444',
                                        '&:hover': {
                                          borderColor: '#DC2626',
                                          backgroundColor:
                                            'rgba(239, 68, 68, 0.1)'
                                        }
                                      }}>
                                      회사 삭제
                                    </Button>
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider />
                          {devMembers
                            .filter(
                              member => member.companyName === companyName
                            )
                            .map(member => (
                              <ListItem key={member.memberId}>
                                <ListItemIcon>
                                  <User
                                    size={20}
                                    color={theme.palette.primary.main}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}>
              <Typography
                variant="body1"
                                        component="span"
                                        sx={{ color: '#1F2937' }}>
                                        {member.memberName}
              </Typography>
                                      <Chip
                                        label={
                                          member.role.includes('MANAGER')
                                            ? '담당자'
                                            : '일반멤버'
                                        }
                                        size="small"
                                        sx={{
                                          backgroundColor: member.role.includes(
                                            'MANAGER'
                                          )
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
            setSelectedCompanyMembers({
              companyId: 0,
              companyName: '',
              companyType: 'client',
              members: []
            })
          }}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <Typography>
                {selectedCompanyMembers.companyName} 멤버 관리
              </Typography>
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
                멤버 수정
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
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}>
              <Typography
                variant="subtitle2"
                      sx={{ color: theme.palette.primary.main }}>
                      담당자
              </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedMemberSections(prev => ({
                          ...prev,
                          [selectedCompanyMembers.companyId]: {
                            ...prev[selectedCompanyMembers.companyId],
                            managers:
                              !prev[selectedCompanyMembers.companyId]?.managers
                          }
                        }))
                      }
                      sx={{
                        color: '#64748b',
                        '&:hover': { backgroundColor: 'transparent' }
                      }}>
                      {expandedMemberSections[selectedCompanyMembers.companyId]
                        ?.managers ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </IconButton>
                  </Stack>
                  <Collapse
                    in={
                      expandedMemberSections[selectedCompanyMembers.companyId]
                        ?.managers ?? true
                    }>
                    <List>
                      {selectedCompanyMembers.members
                        .filter(member => member.role.includes('MANAGER'))
                        .map(member => (
                  <ListItem
                            key={member.memberId}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  handleMemberDelete(member.memberId)
                                }
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': {
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                  }
                                }}>
                                <X size={20} />
                              </IconButton>
                            }>
                            <ListItemIcon>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                  <Typography
                                    variant="body1"
                                    component="span">
                                    {member.memberName}
                                  </Typography>
                                  <Chip
                                    label={
                                      member.role.includes('MANAGER')
                                        ? '담당자'
                                        : '일반멤버'
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor: member.role.includes(
                                        'MANAGER'
                                      )
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
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}>
              <Typography
                variant="subtitle2"
                      sx={{ color: '#64748b' }}>
                      일반 멤버
              </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedMemberSections(prev => ({
                          ...prev,
                          [selectedCompanyMembers.companyId]: {
                            ...prev[selectedCompanyMembers.companyId],
                            members:
                              !prev[selectedCompanyMembers.companyId]?.members
                          }
                        }))
                      }
                      sx={{
                        color: '#64748b',
                        '&:hover': { backgroundColor: 'transparent' }
                      }}>
                      {expandedMemberSections[selectedCompanyMembers.companyId]
                        ?.members ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </IconButton>
                  </Stack>
                  <Collapse
                    in={
                      expandedMemberSections[selectedCompanyMembers.companyId]
                        ?.members ?? true
                    }>
                    <List>
                      {selectedCompanyMembers.members
                        .filter(member => !member.role.includes('MANAGER'))
                        .map(member => (
                  <ListItem
                            key={member.memberId}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  handleMemberDelete(member.memberId)
                                }
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': {
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                  }
                                }}>
                                <X size={20} />
                              </IconButton>
                            }>
                            <ListItemIcon>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                  <Typography
                                    variant="body1"
                                    component="span">
                                    {member.memberName}
                                  </Typography>
                                  <Chip
                                    label={
                                      member.role.includes('MANAGER')
                                        ? '담당자'
                                        : '일반멤버'
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor: member.role.includes(
                                        'MANAGER'
                                      )
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
            <Button
              onClick={() => {
                setOpenMemberDialog(false)
                setSelectedCompanyMembers({
                  companyId: 0,
                  companyName: '',
                  companyType: 'client',
                  members: []
                })
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
          <DialogTitle>
            {companyType === 'dev' ? '개발사 추가' : '고객사 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={`${companyType === 'dev' ? '개발사' : '고객사'} 검색`}
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
              {filteredAvailableCompanies.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    추가 가능한 {companyType === 'dev' ? '개발사' : '고객사'}가
                    없습니다.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  <List>
                    {filteredAvailableCompanies
                      .filter(company =>
                        company.name
                          .toLowerCase()
                          .includes(companySearch.toLowerCase())
                      )
                      .map(company => (
                        <ListItem
                          key={company.id}
                          button
                          onClick={() => handleCompanySelect(company)}
                          sx={{
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}>
                          <ListItemText
                            primary={
              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 500 }}>
                                {company.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                color="text.secondary"
                                component="span">
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
            setSelectedCompanyManagers([])
            setSelectedRegularMembers([])
            setMemberSearch('')
          }}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>{selectedNewCompany?.name} 멤버 선택</DialogTitle>
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
                      member.name
                        .toLowerCase()
                        .includes(memberSearch.toLowerCase())
                    )
                    .map(member => {
                      // 이미 프로젝트에 속해있는 멤버인지 확인
                      const isExistingMember =
                        selectedCompanyMembers.members.some(
                          existingMember =>
                            existingMember.memberId === member.id
                        )

                      return (
                        <ListItem
                          key={member.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1
                            }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
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
                              color={
                                selectedCompanyManagers.includes(
                                  Number(member.id)
                                )
                                  ? 'primary'
                                  : 'inherit'
                              }
                              onClick={() => {
                                if (
                                  selectedRegularMembers.includes(member.id)
                                ) {
                                  setSelectedRegularMembers(prev =>
                                    prev.filter(id => id !== member.id)
                                  )
                                }
                                setSelectedCompanyManagers(prev =>
                                  prev.includes(Number(member.id))
                                    ? isExistingMember
                                      ? prev // 이미 프로젝트에 속한 멤버는 선택 해제 불가
                                      : prev.filter(
                                          id => id !== Number(member.id)
                                        )
                                    : [...prev, Number(member.id)]
                                )
                              }}
                              sx={{
                                minWidth: 80,
                                borderColor: selectedCompanyManagers.includes(
                                  Number(member.id)
                                )
                                  ? theme.palette.primary.main
                                  : '#e2e8f0',
                                color: selectedCompanyManagers.includes(
                                  Number(member.id)
                                )
                                  ? theme.palette.primary.main
                                  : '#64748b',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  backgroundColor: 'rgba(59, 130, 246, 0.04)'
                                }
                              }}>
                              담당자
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color={
                                selectedRegularMembers.includes(member.id)
                                  ? 'primary'
                                  : 'inherit'
                              }
                              onClick={() => {
                                if (
                                  selectedCompanyManagers.includes(
                                    Number(member.id)
                                  )
                                ) {
                                  setSelectedCompanyManagers(prev =>
                                    prev.filter(id => id !== Number(member.id))
                                  )
                                }
                                if (isExistingMember) {
                                  // 이미 프로젝트에 속한 멤버는 선택 해제 불가
                                  if (
                                    !selectedRegularMembers.includes(member.id)
                                  ) {
                                    handleRegularMemberToggle(member.id)
                                  }
                                } else {
                                  handleRegularMemberToggle(member.id)
                                }
                              }}
                              sx={{
                                minWidth: 80,
                                borderColor: selectedRegularMembers.includes(
                                  member.id
                                )
                                  ? theme.palette.primary.main
                                  : '#e2e8f0',
                                color: selectedRegularMembers.includes(
                                  member.id
                                )
                                  ? theme.palette.primary.main
                                  : '#64748b',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  backgroundColor: 'rgba(59, 130, 246, 0.04)'
                                }
                              }}>
                              일반멤버
                            </Button>
                          </Box>
                        </ListItem>
                      )
                    })}
                </List>
              </Box>

              {/* Selected Members Section */}
              <Box sx={{ mt: 4 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.primary.main }}>
                    선택된 담당자
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setExpandedMemberSections(prev => ({
                        ...prev,
                        [selectedNewCompany?.id || 0]: {
                          ...prev[selectedNewCompany?.id || 0],
                          managers: !prev[selectedNewCompany?.id || 0]?.managers
                        }
                      }))
                    }
                    sx={{
                      color: '#64748b',
                      '&:hover': { backgroundColor: 'transparent' }
                    }}>
                    {expandedMemberSections[selectedNewCompany?.id || 0]
                      ?.managers ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </IconButton>
                </Stack>
                <Collapse
                  in={
                    expandedMemberSections[selectedNewCompany?.id || 0]
                      ?.managers ?? true
                  }>
                  <List>
                    {selectedCompanyManagers.map(managerId => {
                      const manager = companyMembers.find(
                        m => m.id === managerId
                      )
                      const isExistingMember =
                        selectedCompanyMembers.members.some(
                          existingMember =>
                            existingMember.memberId === managerId
                        )
                      return manager ? (
                        <ListItem key={managerId}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <User
                              size={20}
                              color={theme.palette.primary.main}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                <Typography
                                  variant="body1"
                                  component="span">
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
                              onClick={() =>
                                setSelectedCompanyManagers(prev =>
                                  prev.filter(id => id !== managerId)
                                )
                              }
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                }
                              }}>
                              <X size={20} />
                            </IconButton>
                          )}
                        </ListItem>
                      ) : null
                    })}
                  </List>
                </Collapse>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 1, mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b' }}>
                    선택된 일반 멤버
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setExpandedMemberSections(prev => ({
                        ...prev,
                        [selectedNewCompany?.id || 0]: {
                          ...prev[selectedNewCompany?.id || 0],
                          members: !prev[selectedNewCompany?.id || 0]?.members
                        }
                      }))
                    }
                    sx={{
                      color: '#64748b',
                      '&:hover': { backgroundColor: 'transparent' }
                    }}>
                    {expandedMemberSections[selectedNewCompany?.id || 0]
                      ?.members ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </IconButton>
                </Stack>
                <Collapse
                  in={
                    expandedMemberSections[selectedNewCompany?.id || 0]
                      ?.members ?? true
                  }>
                  <List>
                    {companyMembers
                      .filter(member =>
                        selectedRegularMembers.includes(member.id)
                      )
                      .map(member => {
                        const isExistingMember =
                          selectedCompanyMembers.members.some(
                            existingMember =>
                              existingMember.memberId === member.id
                          )
                        return (
                          <ListItem key={member.id}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <User
                                size={20}
                                color={theme.palette.primary.main}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                  <Typography
                                    variant="body1"
                                    component="span">
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
                                onClick={() =>
                                  handleRegularMemberToggle(member.id)
                                }
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
                setSelectedCompanyManagers([])
                setSelectedRegularMembers([])
                setMemberSearch('')
              }}>
              취소
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={
                companyType === 'dev'
                  ? handleAddDevCompany
                  : handleAddNewMembers
              }
              disabled={
                selectedCompanyManagers.length === 0 &&
                selectedRegularMembers.length === 0
              }>
              추가
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Member Confirmation Dialog */}
        <Dialog
          open={showDeleteMemberDialog}
          onClose={() => {
            setShowDeleteMemberDialog(false)
            setMemberToDelete(null)
          }}>
          <DialogTitle>멤버 삭제 확인</DialogTitle>
          <DialogContent>
            <Typography>정말로 이 멤버를 삭제하시겠습니까?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowDeleteMemberDialog(false)
                setMemberToDelete(null)
              }}
            color="primary">
            취소
          </Button>
          <Button
              onClick={confirmMemberDelete}
            color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

        {/* Delete Company Confirmation Dialog */}
        <Dialog
          open={showDeleteCompanyDialog}
          onClose={() => {
            setShowDeleteCompanyDialog(false)
            setCompanyToDelete(null)
          }}>
          <DialogTitle>회사 삭제 확인</DialogTitle>
          <DialogContent>
            <Typography>
              정말 해당 프로젝트에서 {companyToDelete?.name} 회사를
              제외시키겠습니까?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowDeleteCompanyDialog(false)
                setCompanyToDelete(null)
              }}
              color="primary">
              취소
            </Button>
            <Button
              onClick={handleCompanyDelete}
              color="error">
              삭제
            </Button>
          </DialogActions>
        </Dialog>

        {/* 개발사 추가 전용 다이얼로그 */}
        <Dialog
          open={showAddDevCompanyDialog}
          onClose={() => {
            setShowAddDevCompanyDialog(false)
            setSelectedCompany(null)
            setSelectedMembers([])
          }}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>개발사 추가</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="개발사 검색"
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
              ) : availableCompanies.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    추가 가능한 개발사가 없습니다.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  <List>
                    {filteredAvailableCompanies
                      .filter(company =>
                        company.name
                          .toLowerCase()
                          .includes(companySearch.toLowerCase())
                      )
                      .map(company => (
                        <ListItem
                          key={company.id}
                          button
                          onClick={() => handleDevCompanySelect(company)}
                          sx={{
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 500 }}>
                                {company.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span">
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
                setShowAddDevCompanyDialog(false)
                setSelectedCompany(null)
                setSelectedMembers([])
              }}>
              취소
            </Button>
          </DialogActions>
        </Dialog>

        {/* 고객사 추가 다이얼로그 */}
        <Dialog
          open={showAddClientCompanyDialog}
          onClose={() => {
            setShowAddClientCompanyDialog(false)
            setSelectedCompany(null)
            setSelectedMembers([])
          }}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>
            {companyType === 'dev' ? '개발사' : '고객사'} 추가
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={`${companyType === 'dev' ? '개발사' : '고객사'} 검색`}
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
              {filteredAvailableCompanies.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    추가 가능한 {companyType === 'dev' ? '개발사' : '고객사'}가
                    없습니다.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  <List>
                    {filteredAvailableCompanies
                      .filter(company =>
                        company.name
                          .toLowerCase()
                          .includes(companySearch.toLowerCase())
                      )
                      .map(company => (
                        <ListItem
                          key={company.id}
                          button
                          onClick={() => {
                            setSelectedNewCompany({
                              id: company.id,
                              name: company.name
                            })
                            setShowAddClientCompanyDialog(false)
                            setShowAddCompanyMemberDialog(true)
                          }}
                          sx={{
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 500 }}>
                                {company.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span">
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
                setShowAddClientCompanyDialog(false)
                setSelectedCompany(null)
                setSelectedMembers([])
              }}>
              취소
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default ProjectDetail
