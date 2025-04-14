import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Tabs, Tab } from '@mui/material'
import {
  Project,
  Stage,
  ProjectStatus,
  StageStatus
} from '../../../types/project'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import ProjectArticle from '../../../components/projects/ProjectArticle'
import PaymentManagement from '../../../components/projects/PaymentManagement'
import ProgressManagement from '../../../components/projects/ProgressManagement'
import { projectService } from '../../../services/projectService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { client } from '../../../api/client'

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const [projectData, stagesData] = await Promise.all([
          projectService.getProjectById(parseInt(id)),
          projectService.getProjectStages(parseInt(id))
        ])
        setProject({
          ...projectData,
          progress: 0
        })
        const convertedStages = stagesData.map(stage => ({
          id: stage.id,
          title: stage.name,
          name: stage.name,
          stageOrder: stage.stageOrder,
          order: stage.stageOrder,
          status: '진행중' as StageStatus,
          tasks: []
        }))
        setStages(convertedStages)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

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
      />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mt: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: '#FFB800'
          }
        }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 120,
              fontWeight: 'medium',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#FFB800'
              }
            }
          }}>
          <Tab label="결제 관리" />
          <Tab label="질문 관리" />
          <Tab label="진척 관리" />
        </Tabs>
      </Box>

      <TabPanel
        value={tabValue}
        index={0}>
        <PaymentManagement
          projectId={project.id}
          stages={stages}
        />
      </TabPanel>

      <TabPanel
        value={tabValue}
        index={1}>
        <ProjectArticle
          projectId={project.id}
          stages={stages}
        />
      </TabPanel>

      <TabPanel
        value={tabValue}
        index={2}>
        <ProgressManagement
          projectId={project.id}
          stages={stages}
        />
      </TabPanel>
    </Box>
  )
}

export default UserProject
