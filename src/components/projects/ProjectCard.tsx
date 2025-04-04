import React from 'react'
import { Box, Paper, Typography, LinearProgress } from '@mui/material'
import dayjs from 'dayjs'
import type { Project } from '../../types/project'

interface ProjectWithProgress extends Project {
  progress: number
}

interface ProjectCardProps {
  project: ProjectWithProgress
  onClick?: (projectId: number) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Paper
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined
      }}
      onClick={() => onClick?.(project.id)}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold' }}>
          {project.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary">
          {project.progress}%
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={project.progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.100'
          }}
        />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary">
        {dayjs(project.endDate).format('YYYY.MM.DD')}
      </Typography>
    </Paper>
  )
}

export default ProjectCard
