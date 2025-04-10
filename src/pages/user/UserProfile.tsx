import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import { User, Mail, Phone, Building } from 'lucide-react'
import { useUserStore } from '../../stores/userStore'

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useUserStore()
  const [user, setUser] = useState(currentUser)

  useEffect(() => {
    // TODO: API 호출로 사용자 정보 가져오기
    // 현재는 로그인한 사용자의 정보를 사용
    setUser(currentUser)
  }, [currentUser, id])

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '관리자'
      case 'USER':
        return '사용자'
      default:
        return role
    }
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>사용자 정보를 찾을 수 없습니다.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs={12}
            md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: 'primary.main'
                }}>
                {user.name.charAt(0)}
              </Avatar>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom>
                {user.name}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary">
                {getRoleName(user.role)}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <User size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="아이디"
                  secondary={user.authId}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Mail size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="이메일"
                  secondary={user.email}
                />
              </ListItem>
              <Divider />
              {user.phoneNumber && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <Phone size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary="전화번호"
                      secondary={user.phoneNumber}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
              {user.company && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <Building size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary="회사"
                      secondary={user.company.name}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default UserProfile
