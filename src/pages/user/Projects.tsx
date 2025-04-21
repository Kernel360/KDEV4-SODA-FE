import React from 'react'
import { Box, Typography, Container, Paper } from '@mui/material'
import { FolderKanban } from 'lucide-react'
import ProjectList from './ProjectList'

const Projects: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ProjectList />
      </Box>
    </Container>
  )
}

export default Projects
