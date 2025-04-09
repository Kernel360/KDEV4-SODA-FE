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

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const data = await projectService.getProjectById(parseInt(id))
        setProject({
          ...data,
          progress: 0 // TODO: 실제 진행률 계산 로직 추가
        })
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
      <ProjectStages projectId={project.id} />
      <ProjectArticle projectId={project.id} />
    </Box>
  )
}

export default UserProject
