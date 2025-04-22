import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material'
import { ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import type { Project } from '../../types/project'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // 진행률 계산 (임시로 0으로 설정)
  const progress = 0

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3
        }
      }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '80%'
            }}>
            {project.title}
          </Typography>
          <ChevronRight size={20} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary">
              개발사:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 500 }}>
              {project.devCompanyNames?.join(', ') || '없음'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary">
              고객사:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 500 }}>
              {project.clientCompanyNames?.join(', ') || '없음'}
            </Typography>
          </Box>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Typography
              variant="caption"
              color="text.secondary">
              {dayjs(project.startDate).format('YYYY.MM.DD')} ~{' '}
              {dayjs(project.endDate).format('YYYY.MM.DD')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flexGrow: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary">
            {progress}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
