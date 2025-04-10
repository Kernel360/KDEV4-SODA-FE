import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material'
import { useUserStore } from '../../stores/userStore'
import Cookies from 'js-cookie'

interface Notification {
  id: number
  message: string
  type: 'approval_request' | 'approval_accepted' | 'approval_rejected'
  createdAt: string
  isRead: boolean
}

interface HeaderProps {
  sx?: React.CSSProperties | any
}

const Header: React.FC<HeaderProps> = ({ sx }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const { user, clearUser } = useUserStore()

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
    const isAdminRoute = location.pathname.startsWith('/admin')
    navigate(isAdminRoute ? '/admin' : '/user')
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
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Clear cookies
    Cookies.remove('refreshToken')

    // Clear user state
    clearUser()

    // Close profile menu
    handleProfileClose()

    // Navigate to main page
    navigate('/')
  }

  const handleMyPage = () => {
    navigate('/mypage')
    handleProfileClose()
  }

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
        ...sx
      }}>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: '64px !important',
          px: { xs: 2, sm: 4, md: 6 }
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={handleLogoClick}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#F59E0B',
              letterSpacing: 'tight'
            }}>
            SODA
          </Typography>
        </Box>

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
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                '& .username': { color: 'primary.main' },
                '& .chevron': { color: 'primary.main' }
              }
            }}>
            <Typography
              variant="body1"
              className="username"
              sx={{
                color: 'text.primary',
                transition: 'color 0.2s'
              }}>
              {user?.name || '사용자'}
            </Typography>
            <ChevronDown
              size={20}
              className="chevron"
              style={{
                color: '#374151',
                transition: 'color 0.2s'
              }}
            />
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
            <MenuItem
              onClick={handleMyPage}
              sx={{ py: 1 }}>
              <ListItemIcon>
                <User size={20} />
              </ListItemIcon>
              <ListItemText>마이페이지</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{ py: 1 }}>
              <ListItemIcon>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText>로그아웃</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
