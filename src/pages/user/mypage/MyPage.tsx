import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Grid, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { memberService } from '../../../services/memberService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'

interface UserInfo {
  id: number
  authId: string
  name: string
  email: string
  role: string
  position: string
  phoneNumber: string
  companyId: number
  companyName: string
  createdAt: string
  updatedAt: string
  deleted: boolean
}

const MyPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<UserInfo>>({})
  const { showToast } = useToast()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await memberService.getMyInfo()
        setUserInfo(data)
        setEditFormData({
          name: data.name,
          phoneNumber: data.phoneNumber,
          position: data.position
        })
      } catch (error) {
        setError('사용자 정보를 불러오는데 실패했습니다.')
        console.error('Error fetching user info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleEditClick = () => {
    setIsEditDialogOpen(true)
  }

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
  }

  const handleEditSubmit = async () => {
    try {
      await memberService.updateMyInfo(editFormData)
      showToast('정보가 수정되었습니다.', 'success')
      setIsEditDialogOpen(false)
      // 정보 갱신
      const data = await memberService.getMyInfo()
      setUserInfo(data)
    } catch (error) {
      showToast('정보 수정에 실패했습니다.', 'error')
      console.error('Error updating user info:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  }

  if (!userInfo) {
    return null
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
          마이페이지
        </Typography>
        <Button
          variant="contained"
          onClick={handleEditClick}
          sx={{
            backgroundColor: 'black',
            '&:hover': {
              backgroundColor: 'black'
            }
          }}>
          정보 수정
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              기본 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  이름
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  전화번호
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  이메일
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.email}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              회사 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  회사명
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.companyName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  직책
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.position}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              계정 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  아이디
                </Typography>
                <Typography component="div" variant="body1">
                  {userInfo.authId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="div" variant="subtitle2" color="text.secondary">
                  가입일
                </Typography>
                <Typography component="div" variant="body1">
                  {new Date(userInfo.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>정보 수정</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={editFormData.name || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="전화번호"
                name="phoneNumber"
                value={editFormData.phoneNumber || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="직책"
                name="position"
                value={editFormData.position || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>취소</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MyPage 