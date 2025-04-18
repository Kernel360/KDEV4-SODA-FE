import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Briefcase
} from 'lucide-react'

interface UserSidebarProps {
  isOpen: boolean
}

const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      path: '/user/dashboard',
      icon: <LayoutDashboard size={24} />,
      text: '대시보드'
    },
    {
      path: '/user/requests',
      icon: <ClipboardList size={24} />,
      text: '요청사항 목록'
    },
    {
      path: '/user/recent-posts',
      icon: <FileText size={24} />,
      text: '최근 게시글'
    },
    {
      path: '/user/projects',
      icon: <Briefcase size={24} />,
      text: '참여 중인 프로젝트'
    }
  ]

  return (
    <Box
      sx={{
        width: isOpen ? 280 : 0,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        backgroundColor: 'background.paper',
        position: 'fixed',
        left: 0,
        top: 64,
        pt: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem
              disablePadding
              sx={{ mb: index === 0 ? 2 : 1 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  py: 1.5,
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
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index === 0 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}

export default UserSidebar
