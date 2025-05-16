import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle
} from 'lucide-react'
import {
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Select,
  FormControl,
  SelectChangeEvent
} from '@mui/material'
import { useUserStore } from '../../stores/userStore'
import NotificationCenter from '../common/NotificationCenter'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import { useToast } from '../../contexts/ToastContext'
import type { MemberStatus } from '../../types/member'
import {
  MemberStatusDescription,
  MemberStatusWorkable
} from '../../types/member'

interface HeaderProps {
  onSidebarToggle: () => void
  isSidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const navigate = useNavigate()
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null)
  const { user, logout, updateStatus } = useUserStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { showToast } = useToast()

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (user && user.status !== 'AWAY') {
        try {
          // 비동기 작업을 동기적으로 처리하기 위해 localStorage에 플래그 설정
          localStorage.setItem('shouldUpdateStatus', 'true')
          // 상태 업데이트 시도
          await updateStatus('AWAY')
        } catch (error) {
          console.error('Failed to update status before unload:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // 컴포넌트 마운트 시 이전 세션에서 상태 업데이트가 필요했는지 확인
    const shouldUpdateStatus = localStorage.getItem('shouldUpdateStatus')
    if (shouldUpdateStatus === 'true') {
      localStorage.removeItem('shouldUpdateStatus')
      if (user && user.status !== 'AWAY') {
        updateStatus('AWAY').catch(console.error)
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user, updateStatus])

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

  const handleLogout = async () => {
    try {
      await logout()
      showToast('로그아웃되었습니다.', 'success', 1000)
      handleProfileClose()
      navigate('/login')
    } catch (error) {
      showToast('로그아웃에 실패했습니다.', 'error', 1000)
    }
  }

  const handleMyPage = () => {
    handleProfileClose()
    navigate('/user/profile')
  }

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchor(event.currentTarget)
  }

  const handleStatusClose = () => {
    setStatusAnchor(null)
  }

  const handleStatusChange = async (newStatus: MemberStatus) => {
    try {
      await updateStatus(newStatus)
      showToast('상태가 변경되었습니다.', 'success', 1000)
      handleStatusClose()
    } catch (error) {
      showToast('상태 변경에 실패했습니다.', 'error', 1000)
    }
  }

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return '#22c55e' // green-500
      case 'BUSY':
        return '#ef4444' // red-500
      case 'AWAY':
        return '#f59e0b' // amber-500
      case 'ON_VACATION':
        return '#6366f1' // indigo-500
      default:
        return '#9ca3af' // gray-400
    }
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
        borderColor: 'divider',
        p: 0,
        minHeight: isMobile ? 48 : 64
      }}>
      <Toolbar
        sx={{
          minHeight: isMobile ? 48 : 64,
          px: isMobile ? 1 : 2,
          py: 0,
          gap: isMobile ? 1 : 2
        }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onSidebarToggle}
          sx={{ mr: isMobile ? 1 : 2, p: isMobile ? 0.5 : 1 }}>
          {isSidebarOpen ? (
            <ChevronLeft size={isMobile ? 20 : 24} />
          ) : (
            <ChevronRight size={isMobile ? 20 : 24} />
          )}
        </IconButton>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            color: '#F59E0B',
            fontWeight: 'bold',
            fontSize: isMobile ? '1.1rem' : undefined,
            letterSpacing: isMobile ? 0 : undefined
          }}
          onClick={handleLogoClick}>
          SODA
        </Typography>
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 1.2 : 3
            }}>
            <NotificationCenter />

            <Box
              onClick={handleStatusClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                backgroundColor: 'action.hover',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                <Circle
                  size={8}
                  fill={getStatusColor(user.status)}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? '0.875rem' : undefined,
                    color: 'text.primary',
                    fontWeight: 500
                  }}>
                  {MemberStatusDescription[user.status]}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={statusAnchor}
              open={Boolean(statusAnchor)}
              onClose={handleStatusClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  minWidth: isMobile ? '140px' : '160px',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5
                  }
                }
              }}>
              {Object.entries(MemberStatusDescription).map(
                ([status, description]) => (
                  <MenuItem
                    key={status}
                    onClick={() => handleStatusChange(status as MemberStatus)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      },
                      '&:active': {
                        backgroundColor: 'action.selected'
                      }
                    }}>
                    <Circle
                      size={8}
                      fill={getStatusColor(status as MemberStatus)}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: status === user.status ? 600 : 400,
                        color:
                          status === user.status
                            ? 'primary.main'
                            : 'text.primary'
                      }}>
                      {description}
                    </Typography>
                  </MenuItem>
                )
              )}
            </Menu>

            <Box
              onClick={handleProfileClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 0.3 : 0.5,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}>
              <Box
                sx={{
                  width: isMobile ? 26 : 32,
                  height: isMobile ? 26 : 32,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: isMobile ? 0.5 : 1
                }}>
                <svg
                  width={isMobile ? 18 : 22}
                  height={isMobile ? 18 : 22}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="#9CA3AF"
                  />
                </svg>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mr: isMobile ? 0.2 : 0.5
                }}>
                <Typography
                  variant={isMobile ? 'body2' : 'body1'}
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1,
                    fontSize: isMobile ? '0.95rem' : undefined
                  }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1,
                    fontSize: isMobile ? '0.7rem' : undefined
                  }}>
                  {user.role === 'ADMIN' ? 'SODA' : user.company?.name || '-'} |{' '}
                  {user.role === 'ADMIN' ? '관리자' : user.position || '-'}
                </Typography>
              </Box>
              <ChevronDown size={isMobile ? 14 : 16} />
            </Box>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleProfileClose}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: isMobile ? '140px' : '200px',
                  marginTop: '8px',
                  borderRadius: '8px',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }
              }}>
              <MenuItem
                onClick={handleMyPage}
                sx={{
                  minHeight: isMobile ? 32 : 40,
                  fontSize: isMobile ? '0.95rem' : undefined
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                  <User size={isMobile ? 14 : 16} />
                  <Typography variant="body2">마이페이지</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  minHeight: isMobile ? 32 : 40,
                  fontSize: isMobile ? '0.95rem' : undefined
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                  <LogOut size={isMobile ? 14 : 16} />
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
