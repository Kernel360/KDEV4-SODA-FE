import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { Plus } from 'lucide-react'
import useProjectStore from '../../../stores/projectStore'
import ProjectCard from '../../../components/projects/ProjectCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()

  useEffect(() => {
    fetchAllProjects()
  }, [fetchAllProjects])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchAllProjects}
      />
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography variant="h5">프로젝트 관리</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => navigate('/admin/projects/create')}>
          프로젝트 생성
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          '& > *': {
            flexGrow: 1,
            minWidth: {
              xs: '100%',
              sm: 'calc(50% - 24px)',
              md: 'calc(33.333% - 32px)'
            },
            maxWidth: {
              xs: '100%',
              sm: 'calc(50% - 24px)',
              md: 'calc(33.333% - 32px)'
            }
          }
        }}>
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/admin/projects/${project.id}`)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default ProjectList
