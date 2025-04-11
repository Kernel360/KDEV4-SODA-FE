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
import useProjectStore from '../../stores/projectStore'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { formatDate } from '../../utils/dateUtils'

const mockEvents = [
  { time: '10:00 AM', title: '프로젝트 미팅', type: 'meeting' as const },
  { time: '2:00 PM', title: '클라이언트 미팅', type: 'meeting' as const },
  { time: '4:30 PM', title: '팀 리뷰', type: 'review' as const }
]

const AdminMain: React.FC = () => {
  const navigate = useNavigate()
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()

  React.useEffect(() => {
    fetchAllProjects()
  }, [fetchAllProjects])

  const handleProjectClick = (projectId: number) => {
    navigate(`/admin/projects/${projectId}`)
  }

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
                <TableCell>시작일</TableCell>
                <TableCell>마감일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(project => (
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
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>{formatDate(project.endDate)}</TableCell>
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
