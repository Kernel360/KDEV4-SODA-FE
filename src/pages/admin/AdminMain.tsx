import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import SimpleCalendar from '../../components/calendar/SimpleCalendar'

// Mock data
const mockProjects = [
  {
    id: 1,
    title: '웹사이트 리뉴얼 프로젝트',
    progress: 75,
    dueDate: '2024.03.15'
  },
  {
    id: 2,
    title: '모바일 앱 개발',
    progress: 45,
    dueDate: '2024.03.30'
  },
  {
    id: 3,
    title: 'ERP 시스템 구축',
    progress: 60,
    dueDate: '2024.04.15'
  }
]

const mockEvents = [
  { time: '10:00 AM', title: '프로젝트 미팅', type: 'meeting' as const },
  { time: '2:00 PM', title: '클라이언트 미팅', type: 'meeting' as const },
  { time: '4:30 PM', title: '팀 리뷰', type: 'review' as const }
]

const AdminMain: React.FC = () => {
  const navigate = useNavigate()

  const handleProjectClick = (projectId: number) => {
    navigate(`/admin/projects/${projectId}`)
  }

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: '1 1 60%' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}>
          진행중인 프로젝트
        </Typography>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>프로젝트명</TableCell>
                <TableCell>진행률</TableCell>
                <TableCell>마감일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockProjects.map(project => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Typography
                      onClick={() => handleProjectClick(project.id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main'
                        }
                      }}>
                      {project.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 6,
                          backgroundColor: '#E5E7EB',
                          borderRadius: 3,
                          mr: 1,
                          overflow: 'hidden'
                        }}>
                        <Box
                          sx={{
                            width: `${project.progress}%`,
                            height: '100%',
                            backgroundColor: 'primary.main',
                            borderRadius: 3
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}>
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{project.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ flex: '1 1 40%' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}>
          일정 관리
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '100%'
          }}>
          <SimpleCalendar events={mockEvents} />
        </Paper>
      </Box>
    </Box>
  )
}

export default AdminMain
