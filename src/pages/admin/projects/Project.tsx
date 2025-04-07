import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material'
import { ArrowLeft, Edit, LayoutDashboard } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import type { Project } from '../../../types/project'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const data = await projectService.getProjectById(parseInt(id))
        setProject(data)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!project) {
    return <ErrorMessage message="프로젝트가 존재하지 않습니다." />
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/projects')}
            sx={{ color: 'text.primary' }}>
            목록으로
          </Button>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Edit size={20} />}
            onClick={() => navigate(`/admin/projects/${id}/edit`)}
            sx={{
              backgroundColor: 'black',
              '&:hover': {
                backgroundColor: 'black'
              }
            }}>
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{
              borderColor: '#ef5350',
              color: '#ef5350',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'transparent'
              }
            }}>
            삭제
          </Button>
          <Button
            variant="contained"
            startIcon={<LayoutDashboard size={20} />}
            onClick={() => navigate(`/user/projects/${id}`)}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}>
            대시보드
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="body1"
          sx={{ mb: 4 }}>
          {project.description}
        </Typography>

        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {project.clientCompanyName}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                계획 시작일
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {formatDate(project.startDate)}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사 담당자
              </Typography>
              <List
                dense
                disablePadding>
                {project.clientCompanyManagers.map((manager, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={manager} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {project.devCompanyName}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                계획 종료일
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {formatDate(project.endDate)}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사 담당자
              </Typography>
              <List
                dense
                disablePadding>
                {project.devCompanyManagers.map((manager, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={manager} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사 일반 참여자
              </Typography>
              <List
                dense
                disablePadding>
                {project.clientCompanyMembers.map((member, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={member} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사 일반 참여자
              </Typography>
              <List
                dense
                disablePadding>
                {project.devCompanyMembers.map((member, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={member} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default Project
