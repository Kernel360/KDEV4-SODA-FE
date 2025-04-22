import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Edit } from 'lucide-react'
import { client } from '../../services/client'
import { Member, Profile } from '../../types/member'

const ProfilePage = () => {
  const [profile, setProfile] = useState<Member | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<Profile>>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await client.get('/members/my')
      setProfile(response.data.data)
    } catch (error) {
      console.error('프로필 정보를 불러오는데 실패했습니다:', error)
    }
  }

  const handleEditClick = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        email: profile.email,
        position: profile.position,
        phoneNumber: profile.phoneNumber
      })
      setIsEditMode(true)
    }
  }

  const handleSave = async () => {
    try {
      await client.patch('/members/my', editData)
      await fetchProfile()
      setIsEditMode(false)
    } catch (error) {
      console.error('프로필 수정에 실패했습니다:', error)
    }
  }

  if (!profile) {
    return <Typography>로딩중...</Typography>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          maxWidth: 600,
          mx: 'auto'
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
          <Typography variant="h5">프로필 정보</Typography>
          <Button
            variant="outlined"
            startIcon={<Edit size={16} />}
            onClick={handleEditClick}>
            수정
          </Button>
        </Box>

        <Grid
          container
          spacing={2}>
          <Grid
            item
            xs={12}>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              이름
            </Typography>
            <Typography variant="body1">{profile.name}</Typography>
          </Grid>

          <Grid
            item
            xs={12}>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              이메일
            </Typography>
            <Typography variant="body1">{profile.email}</Typography>
          </Grid>

          <Grid
            item
            xs={12}>
            <Typography
              variant="subtitle2"
              color="text.secondary">
              직책
            </Typography>
            <Typography variant="body1">{profile.position}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={isEditMode}
        onClose={() => setIsEditMode(false)}>
        <DialogTitle>프로필 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="이름"
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="이메일"
              value={editData.email}
              onChange={e =>
                setEditData({ ...editData, email: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="직책"
              value={editData.position}
              onChange={e =>
                setEditData({ ...editData, position: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="전화번호"
              value={editData.phoneNumber}
              onChange={e =>
                setEditData({ ...editData, phoneNumber: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditMode(false)}>취소</Button>
          <Button
            onClick={handleSave}
            variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProfilePage
