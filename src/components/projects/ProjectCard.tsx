import React from 'react'
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material'
import type { Project } from '../../types/project'
import dayjs from 'dayjs'

interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              backgroundColor: 'action.hover'
            }
          : {}
      }}
      onClick={onClick}>
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="h6">{project.name}</Typography>
            <Chip
              label={project.status}
              color={project.status === '진행중' ? 'primary' : 'default'}
              size="small"
            />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
            {project.description}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center">
            <Typography
              variant="caption"
              color="text.secondary">
              {project.clientCompany}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary">
              {dayjs(project.startDate).format('YYYY.MM.DD')} ~{' '}
              {dayjs(project.endDate).format('YYYY.MM.DD')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
