import React, { useState } from 'react'
import { Box, Typography, IconButton, Collapse } from '@mui/material'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Project } from '../../types/project'

interface ProjectHeaderProps {
  project: Project
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            borderRadius: 1
          },
          p: 1
        }}>
        <Typography variant="h3">{project.title}</Typography>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1
          }}>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              고객사
            </Typography>
            <Typography>{project.clientCompanyName}</Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              개발사
            </Typography>
            <Typography>{project.devCompanyName}</Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              기간
            </Typography>
            <Typography>
              {new Date(project.startDate).toLocaleDateString()} ~{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default ProjectHeader
