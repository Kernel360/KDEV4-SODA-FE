import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Card,
  CardContent,
  Paper,
  Grid
} from '@mui/material'
import { getProjects } from '../../services/projectService'
import type { Project } from '../../types/api'
import { formatDate } from '../../utils/dateUtils'
import { useToast } from '../../contexts/ToastContext'

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects()
        if (response.status === 'success' && response.data && Array.isArray(response.data)) {
          setProjects(response.data)
        }
        setLoading(false)
      } catch (err) {
        setError('프로젝트 목록을 불러오는데 실패했습니다.')
        setLoading(false)
        showToast('프로젝트 목록을 불러오는데 실패했습니다.', 'error')
      }
    }

    fetchProjects()
  }, [showToast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary'
      case 'CONTRACT':
        return 'warning'
      case 'DELIVERED':
        return 'success'
      case 'MAINTENANCE':
        return 'error'
      case 'ON_HOLD':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '진행중'
      case 'CONTRACT':
        return '계약'
      case 'DELIVERED':
        return '납품완료'
      case 'MAINTENANCE':
        return '하자보수'
      case 'ON_HOLD':
        return '일시중단'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>로딩 중...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        프로젝트 목록
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => navigate(`/user/projects/${project.id}`)}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {project.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {project.description}
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  시작일: {formatDate(project.startDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  종료일: {formatDate(project.endDate)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ProjectList
