import React from 'react'
import { Container, Box, Typography, Paper } from '@mui/material'
import ProjectList from './ProjectList'

const Projects: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            border: '1px solid',
            borderColor: 'divider'
          }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: 'text.primary'
            }}>
            소속 회사가 참여중인 프로젝트 목록
          </Typography>
          <ProjectList />
        </Paper>
      </Box>
    </Container>
  )
}

export default Projects
