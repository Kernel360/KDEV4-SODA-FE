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
  Chip
} from '@mui/material'
import { projectService } from '../../services/projectService'
import { Project, ProjectStatus } from '../../types/project'
import { formatDate } from '../../utils/dateUtils'

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getUserProjects()
        console.log(response)
        setProjects(response)
        setLoading(false)
      } catch (err) {
        setError('프로젝트 목록을 불러오는데 실패했습니다.')
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'CONTRACT':
        return 'info'
      case 'IN_PROGRESS':
        return 'primary'
      case 'DELIVERED':
        return 'success'
      case 'MAINTENANCE':
        return 'warning'
      case 'ON_HOLD':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONTRACT':
        return '계약'
      case 'IN_PROGRESS':
        return '진행중'
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
    return <Typography>로딩 중...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box>
      <List>
        {projects.map((project, index) => (
          <React.Fragment key={project.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(`/user/projects/${project.id}`)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'medium' }}>
                        {project.title}
                      </Typography>
                      <Chip
                        label={getStatusText(project.status)}
                        size="small"
                        color={getStatusColor(
                          getStatusText(project.status) as ProjectStatus
                        )}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={`기간: ${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`}
                  secondaryTypographyProps={{
                    color: 'text.secondary'
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < projects.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {projects.length === 0 && (
          <Typography sx={{ p: 2, color: 'text.secondary' }}>
            참여 중인 프로젝트가 없습니다.
          </Typography>
        )}
      </List>
    </Box>
  )
}

export default ProjectList
