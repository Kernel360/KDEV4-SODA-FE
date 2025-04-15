import React from 'react'
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
import {
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  ClipboardList
} from 'lucide-react'
import SideBar from './Sidebar'

const UserSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const userData = localStorage.getItem('user')
  const isAdmin = userData ? JSON.parse(userData).role === 'ADMIN' : false

  if (isAdmin) {
    return <SideBar />
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      path: '/user',
      icon: <LayoutDashboard size={24} />,
      text: '대시보드'
    },
    {
      path: '/user/requests',
      icon: <ListTodo size={24} />,
      text: '요청사항 목록'
    },
    {
      path: '/user/recent-posts',
      icon: <MessageSquare size={24} />,
      text: '최근 게시글'
    },
    {
      path: '/user/projects',
      icon: <ClipboardList size={24} />,
      text: '참여 중인 프로젝트'
    }
  ]

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
        top: 64,
        pt: 2,
        display: 'flex',
        flexDirection: 'column'
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
