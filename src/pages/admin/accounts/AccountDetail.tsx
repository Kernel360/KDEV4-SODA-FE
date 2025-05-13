import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { ArrowLeft, Edit } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import {
  getUserDetail,
  updateUserStatus,
  updateUser,
  getCompanies
} from '../../../api/admin'
import { SelectChangeEvent } from '@mui/material/Select'

interface Company {
  id: number
  name: string
}

interface AccountDetailProps {
  isAdmin?: boolean
}

interface AccountFormData {
  name: string
  email: string
  role: string
  companyId: number
  position: string
  phoneNumber: string
}

export default function AccountDetail({ isAdmin = true }: AccountDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    email: '',
    role: '',
    companyId: 0,
    position: '',
    phoneNumber: ''
  })
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [userResponse, companiesResponse] = await Promise.all([
          getUserDetail(Number(id)),
          getCompanies()
        ])

        if (userResponse.status === 'success' && userResponse.data) {
          setAccount(userResponse.data)
          setFormData({
            name: userResponse.data.name || '',
            email: userResponse.data.email || '',
            role: userResponse.data.role || '',
            companyId: userResponse.data.companyId || 0,
            position: userResponse.data.position || '',
            phoneNumber: userResponse.data.phoneNumber || ''
          })
        } else {
          setError(
            userResponse.message || '사용자 정보를 불러오는데 실패했습니다.'
          )
          showToast('사용자 정보를 불러오는데 실패했습니다.', 'error')
        }

        if (companiesResponse.status === 'success' && companiesResponse.data) {
          setCompanies(companiesResponse.data)
        }
      } catch (err) {
        console.error('데이터 조회 중 오류:', err)
        setError('데이터를 불러오는데 실패했습니다.')
        showToast('데이터를 불러오는데 실패했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, showToast])

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'phoneNumber') {
      formattedValue = formatPhoneNumber(String(value))
    } else if (name === 'email') {
      const emailValue = String(value)
      if (emailValue && !validateEmail(emailValue)) {
        setEmailError('올바른 이메일 형식이 아닙니다')
      } else {
        setEmailError(null)
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      if (formData.email && !validateEmail(formData.email)) {
        showToast('올바른 이메일 형식이 아닙니다', 'error')
        return
      }

      const response = await updateUser(Number(id), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        companyId: formData.companyId,
        position: formData.position,
        phoneNumber: formData.phoneNumber
      })
      if (response.status === 'success') {
        setHasChanges(false)
        setSuccess('사용자 정보가 성공적으로 수정되었습니다.')
        showToast('사용자 정보가 성공적으로 수정되었습니다.', 'success')
        setAccount(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || '',
          companyId: response.data.companyId || 0,
          position: response.data.position || '',
          phoneNumber: response.data.phoneNumber || ''
        })
        setIsEditMode(false)
      } else {
        setError(response.message || '사용자 정보 수정에 실패했습니다.')
        showToast('사용자 정보 수정에 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('사용자 정보 수정 중 오류:', err)
      setError('사용자 정보 수정에 실패했습니다.')
      showToast('사용자 정보 수정에 실패했습니다.', 'error')
    }
  }

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      const response = await updateUserStatus(userId, !currentActive)
      if (response.status === 'success') {
        setAccount((prev: any) => ({
          ...prev,
          deleted: !currentActive
        }))
        showToast('사용자 상태가 성공적으로 변경되었습니다.', 'success')
      } else {
        showToast(
          response.message || '사용자 상태 변경에 실패했습니다.',
          'error'
        )
      }
    } catch (err) {
      console.error('사용자 상태 변경 중 오류:', err)
      showToast('사용자 상태 변경에 실패했습니다.', 'error')
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      navigate(-1)
    }
  }

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false)
    navigate(-1)
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsSubmitting(true)
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        companyId: formData.companyId,
        position: formData.position,
        phoneNumber: formData.phoneNumber
      }
      await updateUser(Number(id), updateData)
      showToast('계정 정보가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/accounts/${id}`)
    } catch (error) {
      console.error('계정 수정 중 오류:', error)
      showToast('계정 수정 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={handleCancel}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}></Button>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600 }}>
            계정 상세 정보
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit size={16} />}
          onClick={() => {
            if (isEditMode) {
              setIsEditMode(false)
              setFormData({
                name: account.name || '',
                email: account.email || '',
                role: account.role || '',
                companyId: account.companyId || 0,
                position: account.position || '',
                phoneNumber: account.phoneNumber || ''
              })
              setHasChanges(false)
            } else {
              handleEditClick()
            }
          }}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}>
          {isEditMode ? '수정 취소' : '정보 수정'}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 3, border: '1px solid #e5e7eb' }}>
        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
              <Typography
                component="h2"
                variant="h6">
                기본 정보
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={!account?.deleted}
                    onChange={() =>
                      account?.id &&
                      handleToggleActive(account.id, !account.deleted)
                    }
                    color="primary"
                  />
                }
                label={account?.deleted ? '비활성화' : '활성화'}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid
              container
              spacing={2}>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  이름
                </Typography>
                {isEditMode ? (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ mt: 1 }}
                      inputProps={{ maxLength: 20 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: -20,
                        color: 'text.secondary'
                      }}>
                      {`${formData.name.length}/20`}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.name}
                  </Typography>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  전화번호
                </Typography>
                {isEditMode ? (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ mt: 1 }}
                      inputProps={{ maxLength: 13 }}
                      placeholder="010-0000-0000"
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: -20,
                        color: 'text.secondary'
                      }}>
                      {`${formData.phoneNumber.replace(/[^\d]/g, '').length}/11`}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.phoneNumber}
                  </Typography>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  이메일
                </Typography>
                {isEditMode ? (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ mt: 1 }}
                      inputProps={{ maxLength: 50 }}
                      placeholder="example@company.com"
                      error={!!emailError}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: -20,
                        color: 'text.secondary'
                      }}>
                      {`${formData.email.length}/50`}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.email}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            xs={12}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ mb: 2 }}>
              회사 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid
              container
              spacing={2}>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  회사명
                </Typography>
                {isEditMode ? (
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}>
                    <InputLabel>회사 선택</InputLabel>
                    <Select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      label="회사 선택">
                      <MenuItem value={0}>없음</MenuItem>
                      {companies.map(company => (
                        <MenuItem
                          key={company.id}
                          value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.companyName || '없음'}
                  </Typography>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  직책
                </Typography>
                {isEditMode ? (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ mt: 1 }}
                      inputProps={{ maxLength: 30 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: -20,
                        color: 'text.secondary'
                      }}>
                      {`${formData.position.length}/30`}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.position}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            xs={12}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ mb: 2 }}>
              계정 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid
              container
              spacing={2}>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  아이디
                </Typography>
                <Typography
                  component="div"
                  variant="body1">
                  {account?.authId}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  가입일
                </Typography>
                <Typography
                  component="div"
                  variant="body1">
                  {new Date(account?.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary">
                  권한
                </Typography>
                {isEditMode ? (
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}>
                    <InputLabel>권한 선택</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      label="권한 선택">
                      <MenuItem value="ADMIN">관리자</MenuItem>
                      <MenuItem value="USER">일반 사용자</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    component="div"
                    variant="body1">
                    {account?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {isEditMode && (
        <Box
          sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasChanges}>
            저장
          </Button>
        </Box>
      )}

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '400px'
          }
        }}>
        <DialogTitle sx={{ pb: 1 }}>수정사항이 있습니다</DialogTitle>
        <DialogContent>
          <Typography>
            저장하지 않은 수정사항이 있습니다. 정말로 나가시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}>
            취소
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
