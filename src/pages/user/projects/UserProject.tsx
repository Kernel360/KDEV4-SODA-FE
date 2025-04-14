import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { Project, Stage, ProjectStatus } from '../../../types/project'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import ProjectStages from '../../../components/projects/ProjectStages'
import ProjectArticle from '../../../components/projects/ProjectArticle'
import { projectService } from '../../../services/projectService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { client } from '../../../api/client'

interface ProjectWithProgress extends Project {
  progress: number
}

interface ApiStage {
  id: number
  name: string
  stageOrder: number
  tasks: {
    taskId: number
    title: string
    content: string
    taskOrder: number
  }[]
}

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [stages, setStages] = useState<ApiStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // stage 목록 새로고침 함수
  const refreshStages = async () => {
    if (!id) return
    try {
      const stagesData = await projectService.getProjectStages(parseInt(id))
      setStages(stagesData)
    } catch (err) {
      console.error('Failed to refresh stages:', err)
    }
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
          progress: 0 // TODO: 실제 진행률 계산 로직 추가
        })
        setStages(stagesData)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

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

  return (
    <Box sx={{ p: 3 }}>
      <ProjectHeader
        project={project}
        onStatusChange={handleStatusChange}
      />
      <ProjectStages
        projectId={project.id}
        stages={stages as unknown as Stage[]}
        onStagesChange={async updatedStages => {
          // API 응답 데이터 형식으로 변환
          const apiStages = updatedStages.map(stage => ({
            id: stage.id,
            name: stage.title,
            stageOrder: stage.order,
            tasks: stage.tasks.map(task => ({
              taskId: task.id,
              title: task.title,
              content: task.description,
              taskOrder: task.order
            }))
          }))
          setStages(apiStages)
          // 게시판 쪽 stage 목록 새로고침
          await refreshStages()
        }}
      />
      <ProjectArticle
        projectId={project.id}
        stages={stages as unknown as Stage[]}
      />
    </Box>
  )
}

export default UserProject
