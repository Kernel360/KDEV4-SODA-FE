import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import {
  Project,
  Stage,
  ProjectStatus,
  StageStatus,
  Task
} from '../../../types/project'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import ProjectArticle from '../../../components/projects/ProjectArticle'
import PaymentManagement from '../../../components/projects/PaymentManagement'
import StageCard from '../../../components/projects/StageCard'
import { projectService } from '../../../services/projectService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { client } from '../../../api/client'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

interface ProjectWithProgress extends Project {
  progress: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

interface ApiStage {
  id: number
  name: string
  stageOrder: number
  requestCount: number
}

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get('tab') === 'articles' ? 1 : 0

  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState(initialTab)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return
    try {
      await client.put(`/projects/${project.id}/status`, { status: newStatus })
      setProject(prev => (prev ? { ...prev, status: newStatus } : null))
    } catch (error) {
      console.error('Failed to update project status:', error)
      throw error
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const fromArticles = location.pathname.includes('/articles/')
    if (fromArticles) {
      setValue(1)
      // URL에서 from 파라미터를 제거하고 tab 파라미터로 대체
      params.set('tab', 'articles')
      navigate(`/user/projects/${id}?${params.toString()}`, { replace: true })
    }
  }, [location.pathname, navigate, id])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
    const newTab = newValue === 1 ? 'articles' : 'payments'
    const params = new URLSearchParams(location.search)
    params.set('tab', newTab)
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleStageEdit = async (stageId: number, newTitle: string) => {
    try {
      await client.put(`/stages/${stageId}`, { name: newTitle })
      setStages(prev =>
        prev.map(stage =>
          stage.id === stageId
            ? { ...stage, title: newTitle, name: newTitle }
            : stage
        )
      )
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleStageDelete = async (stageId: number) => {
    try {
      await client.delete(`/stages/${stageId}`)
      setStages(prev => prev.filter(stage => stage.id !== stageId))
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const handleTaskEdit = async (
    taskId: number,
    title: string,
    content: string
  ) => {
    try {
      await client.put(`/tasks/${taskId}`, { title, content })
      setStages(prev =>
        prev.map(stage => ({
          ...stage,
          tasks: stage.tasks.map(task =>
            task.id === taskId ? { ...task, title, description: content } : task
          )
        }))
      )
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStages(items)
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const [projectData, stagesData] = await Promise.all([
          projectService.getProjectById(parseInt(id)),
          projectService.getProjectStages(parseInt(id))
        ])
        console.log('Project Data:', projectData)
        console.log('Stages Data:', stagesData)
        setProject({
          ...projectData,
          progress: 0
        })
        const convertedStages = (stagesData as unknown as ApiStage[]).map(
          stage => ({
            id: stage.id,
            title: stage.name,
            name: stage.name,
            stageOrder: stage.stageOrder,
            order: stage.stageOrder,
            status: '대기' as StageStatus,
            tasks: []
          })
        )
        console.log('Converted Stages:', convertedStages)
        setStages(convertedStages)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleEditModalOpen = () => {
    console.log('Current stages when opening modal:', stages)
    setEditModalOpen(true)
  }

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (!project) return <ErrorMessage message="프로젝트가 존재하지 않습니다." />

  return (
    <Box sx={{ p: 3 }}>
      <ProjectHeader
        project={project}
        onStatusChange={handleStatusChange}
        stages={stages}
        onStageEdit={handleStageEdit}
        onStageDelete={handleStageDelete}
        onTaskEdit={handleTaskEdit}
        onStagesChange={setStages}
      />

      <Box
        sx={{
          width: '100%',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)'
        }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="project management tabs"
            sx={{
              borderBottom: '1px solid #E0E0E0',
              '& .MuiTab-root': {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                py: 3,
                minHeight: '64px',
                color: '#666',
                '&.Mui-selected': {
                  color: '#FFB800'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFB800',
                height: '3px'
              }
            }}>
            <Tab
              label="승인 관리"
              {...a11yProps(0)}
              sx={{
                flex: 1,
                maxWidth: 'none'
              }}
            />
            <Tab
              label="질문 관리"
              {...a11yProps(1)}
              sx={{
                flex: 1,
                maxWidth: 'none'
              }}
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
          <TabPanel
            value={value}
            index={0}>
            <PaymentManagement
              projectId={Number(id)}
              stages={stages}
            />
          </TabPanel>

          <TabPanel
            value={value}
            index={1}>
            <ProjectArticle
              projectId={Number(id)}
              stages={stages}
            />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  )
}

export default UserProject
