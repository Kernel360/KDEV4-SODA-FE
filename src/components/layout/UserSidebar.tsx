import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material'
import { ClipboardList, LayoutDashboard } from 'lucide-react'
import { projectService } from '../../services/projectService'
import type { Project } from '../../types/project'

const UserSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const projects = await projectService.getUserProjects()
        if (projects && projects.length > 0) {
          setProjects(projects)
        } else {
          setError('참여 중인 프로젝트가 없습니다.')
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('프로젝트 목록을 불러오는데 실패했습니다.')
      }
    }

    fetchUserProjects()
  }, [])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const ProjectItem = ({ id, title }: { id: number; title: string }) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => navigate(`/user/projects/${id}`)}
        selected={isActive(`/user/projects/${id}`)}
        sx={{
          borderRadius: 1,
          mx: 1,
          '&.Mui-selected': {
            backgroundColor: 'primary.50',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.100'
            },
            '& .MuiListItemIcon-root': {
              color: 'primary.main'
            }
          }
        }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <ClipboardList size={20} />
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            noWrap: true
          }}
        />
      </ListItemButton>
    </ListItem>
  )

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        backgroundColor: 'background.paper',
        position: 'fixed',
        left: 0,
        top: 64, // Header height
        pt: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* 대시보드 메뉴 */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/user'}
            onClick={() => navigate('/user')}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.50',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.100'
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                }
              }
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LayoutDashboard size={24} />
            </ListItemIcon>
            <ListItemText
              primary="대시보드"
              primaryTypographyProps={{
                fontSize: '0.875rem'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      {/* 참여 중인 프로젝트 목록 */}
      <Typography
        variant="overline"
        sx={{
          px: 3,
          py: 1,
          color: 'text.secondary',
          fontWeight: 500
        }}>
        참여 중인 프로젝트
      </Typography>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {error ? (
          <Typography
            color="error"
            sx={{ px: 2, py: 1 }}>
            {error}
          </Typography>
        ) : projects.length === 0 ? (
          <Typography sx={{ px: 2, py: 1, color: 'text.secondary' }}>
            참여 중인 프로젝트가 없습니다.
          </Typography>
        ) : (
          projects.map(project => (
            <ProjectItem
              key={project.id}
              id={project.id}
              title={project.title}
            />
          ))
        )}
      </List>
    </Box>
  )
}

export default UserSidebar
