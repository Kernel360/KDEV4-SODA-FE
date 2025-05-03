import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material'
import { useUserStore } from '../../stores/userStore'
import NotificationCenter from '../common/NotificationCenter'

interface HeaderProps {
  onSidebarToggle: () => void
  isSidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const navigate = useNavigate()
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const { user, logout } = useUserStore()

  const handleLogoClick = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      navigate(user.role === 'ADMIN' ? '/admin' : '/user')
    } else {
      navigate('/user')
    }
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget)
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
            <NotificationCenter />

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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
                </svg>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1 }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>{user.company?.name || '-'} | {user.position || '-'}</Typography>
              </Box>
              <ChevronDown size={16} />
            </Box>

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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                  <User size={16} />
                  <Typography variant="body2">마이페이지</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                  <LogOut size={16} />
                  <Typography variant="body2">로그아웃</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
