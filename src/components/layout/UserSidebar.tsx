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
import useProjectStore from '../../stores/projectStore'

const UserSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const { projects, fetchAllProjects } = useProjectStore()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          setError('사용자 정보를 찾을 수 없습니다.')
          return
        }

        const user = JSON.parse(userData)
        if (user.role === 'ADMIN') {
          // 관리자인 경우 전체 프로젝트 조회
          await fetchAllProjects()
        } else {
          // 일반 사용자인 경우 참여 중인 프로젝트만 조회
          const userProjects = await projectService.getUserProjects()
          if (userProjects && userProjects.length > 0) {
            useProjectStore.setState({ projects: userProjects })
          } else {
            setError('프로젝트가 없습니다.')
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('프로젝트 목록을 불러오는데 실패했습니다.')
      }
    }

    fetchProjects()
  }, [fetchAllProjects])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleDashboardClick = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      navigate(user.role === 'ADMIN' ? '/admin' : '/user')
    } else {
      navigate('/user')
    }
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

  const getDashboardText = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.role === 'ADMIN' ? '관리자 페이지로 돌아가기' : '대시보드'
    }
    return '대시보드'
  }

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
            onClick={handleDashboardClick}
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
              primary={getDashboardText()}
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
        {localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).role === 'ADMIN'
            ? '전체 프로젝트 목록'
            : '참여 중인 프로젝트'
          : '프로젝트 목록'}
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
