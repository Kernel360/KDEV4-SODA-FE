import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import ProjectList from './ProjectList'

const Projects: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4 }}>
        참여 중인 프로젝트
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 2, bgcolor: 'background.paper' }}>
        <ProjectList />
      </Paper>
    </Box>
  )
}

export default Projects
