import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { Project } from '../../../types/project'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import ProjectStages from '../../../components/projects/ProjectStages'
import ProjectArticle from '../../../components/projects/ProjectArticle'
import { projectService } from '../../../services/projectService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

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
      <ProjectHeader project={project} />
      <ProjectStages projectId={project.id} stages={stages} />
      <ProjectArticle projectId={project.id} />
    </Box>
  )
}

export default UserProject
