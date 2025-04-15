import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material'
import { useUserStore } from '../../stores/userStore'

interface Notification {
  id: number
  message: string
  type: 'approval_request' | 'approval_accepted' | 'approval_rejected'
  createdAt: string
  isRead: boolean
}

interface HeaderProps {
  onSidebarToggle: () => void
  isSidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const navigate = useNavigate()
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const { user, logout } = useUserStore()

  // Mock data - replace with actual data from your backend
  const notifications: Notification[] = [
    {
      id: 1,
      message: '새로운 승인 요청이 있습니다',
      type: 'approval_request',
      createdAt: '2024-03-20T10:00:00Z',
      isRead: false
    },
    {
      id: 2,
      message: '승인 요청이 반려되었습니다',
      type: 'approval_rejected',
      createdAt: '2024-03-19T15:30:00Z',
      isRead: true
    }
  ]

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  const handleLogoClick = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      navigate(user.role === 'ADMIN' ? '/admin' : '/user')
    } else {
      navigate('/user')
    }
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleProfileClose = () => {
    setProfileAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleProfileClose()
    navigate('/login')
  }

  const handleMyPage = () => {
    handleProfileClose()
    navigate('/user/profile')
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        zIndex: 1200,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}>
          {isSidebarOpen ? (
            <ChevronLeft size={24} />
          ) : (
            <ChevronRight size={24} />
          )}
        </IconButton>
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            color: '#F59E0B',
            fontWeight: 'bold'
          }}
          onClick={handleLogoClick}>
          SODA
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}>
              <Badge
                variant="dot"
                color="error"
                invisible={unreadNotifications === 0}>
                <Bell size={20} />
              </Badge>
            </IconButton>

            <Box
              onClick={handleProfileClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}>
              <Typography variant="body1">{user.name}</Typography>
              <ChevronDown size={16} />
            </Box>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: '320px',
                  marginTop: '8px',
                  borderRadius: '8px',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }
              }}>
              {notifications.map(notification => (
                <MenuItem
                  key={notification.id}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                    ...(!notification.isRead && {
                      backgroundColor: 'action.selected'
                    })
                  }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="body2"
                      color="text.primary">
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleProfileClose}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: '200px',
                  marginTop: '8px',
                  borderRadius: '8px',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }
              }}>
              <MenuItem onClick={handleMyPage}>
                <User
                  size={16}
                  style={{ marginRight: 8 }}
                />
                마이페이지
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogOut
                  size={16}
                  style={{ marginRight: 8 }}
                />
                로그아웃
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
