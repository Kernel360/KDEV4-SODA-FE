import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material'
import ProjectCard from '../../components/projects/ProjectCard'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'
import type { Project } from '../../types/project'

const UserMain: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('UserMain 컴포넌트 마운트')
    fetchUserProjects()
  }, [])

  const fetchUserProjects = async () => {
    try {
      console.log('프로젝트 목록 조회 시작')
      setLoading(true)
      const userProjects = await projectService.getUserProjects()
      console.log('프로젝트 목록 조회 완료:', userProjects)
      setProjects(userProjects.slice(0, 3))
    } catch (err) {
      console.error('프로젝트 목록 조회 중 오류:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : '프로젝트 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectClick = (projectId: number) => {
    navigate(`/user/projects/${projectId}`)
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

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        gutterBottom>
        진행 중인 프로젝트
      </Typography>
      <Grid
        container
        spacing={3}>
        {projects.slice(0, 3).map(project => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={project.id}>
            <ProjectCard
              project={project}
              onClick={() => handleProjectClick(project.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default UserMain
