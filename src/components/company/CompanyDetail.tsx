import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Switch,
  Tooltip,
  InputAdornment
} from '@mui/material'
import {
  Company,
  CompanyMember,
  PasswordPolicy,
  DEFAULT_PASSWORD_POLICY
} from '../../types/company'
import {
  Pencil,
  Trash2,
  Building2,
  Phone,
  FileText,
  MapPin,
  User,
  Users,
  Plus,
  X,
  Save,
  Check
} from 'lucide-react'
import { companyService } from '../../services/companyService'
import { signup, checkIdAvailability } from '../../api/auth'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { validatePassword } from '../../utils/validation'
import CloseIcon from '@mui/icons-material/Close'

interface CompanyDetailProps {
  company: Company
  isEditable?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

interface MemberFormData {
  name: string
  authId: string
  password: string
  confirmPassword: string
  email: string
  position: string
  phoneNumber: string
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  isEditable,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    authId: '',
    password: '',
    confirmPassword: '',
    email: '',
    position: '',
    phoneNumber: ''
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isCheckingAuthId, setIsCheckingAuthId] = useState(false)
  const [authIdError, setAuthIdError] = useState<string | null>(null)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null)

  // 멤버 목록 조회 함수 분리
  const fetchMembers = async () => {
    try {
      const data = await companyService.getCompanyMembers(company.id)
      console.log('회사 멤버 데이터:', data)
      setMembers(data)
    } catch (err) {
      console.error('회사 멤버 조회 에러:', err)
      setError('회사 멤버 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [company.id])

  const handleAddMember = () => {
    setAddMemberDialogOpen(true)
    setFormData({
      name: '',
      authId: '',
      password: '',
      confirmPassword: '',
      email: '',
      position: '',
      phoneNumber: ''
    })
  }

  const handleCloseDialog = () => {
    setAddMemberDialogOpen(false)
    setFormData({
      name: '',
      authId: '',
      password: '',
      confirmPassword: '',
      email: '',
      position: '',
      phoneNumber: ''
    })
  }

  const validateFormData = (): boolean => {
    if (
      !formData.name ||
      !formData.authId ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showToast('모든 필수 항목을 입력해주세요.', 'error')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  const checkAuthIdAvailability = async (authId: string) => {
    if (!authId) {
      showToast('아이디를 입력해주세요.', 'error')
      return
    }

    setIsCheckingAuthId(true)
    setAuthIdError(null)
    setIsIdChecked(false)
    setIsIdAvailable(null)

    try {
      const response = await checkIdAvailability(authId)
      if (response.status === 'success') {
        setIsIdChecked(true)
        setIsIdAvailable(response.data)
        if (response.data) {
          setAuthIdError('')
          showToast('사용 가능한 아이디입니다.', 'success')
        } else {
          setAuthIdError('이미 사용 중인 아이디입니다.')
          showToast('이미 사용 중인 아이디입니다.', 'error')
        }
      } else {
        throw new Error(response.message || '아이디 중복 확인에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('아이디 중복 확인 중 오류:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        '아이디 중복 확인 중 오류가 발생했습니다.'
      setAuthIdError(errorMessage)
      showToast(errorMessage, 'error')
      setIsIdChecked(false)
      setIsIdAvailable(null)
    } finally {
      setIsCheckingAuthId(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'authId') {
      // 아이디가 변경되면 중복확인 상태 초기화
      if (value !== formData.authId) {
        setIsIdChecked(false)
        setIsIdAvailable(null)
        setAuthIdError(null)
      }
    }
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError(null)
    }
  }

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('폼 제출 시작:', formData)

    if (!company) {
      console.error('회사 정보가 없습니다.')
      showToast('회사 정보를 찾을 수 없습니다.', 'error')
      return
    }

    // 필수 입력값 검증
    if (!formData.authId || !formData.password || !formData.name) {
      console.error('필수 입력값 누락:', formData)
      showToast('이름, 아이디, 비밀번호를 모두 입력해주세요.', 'error')
      return
    }

    // ID 중복 체크 검증
    if (!isIdAvailable) {
      console.error('ID 중복 체크가 필요합니다.')
      showToast('아이디 중복 체크를 진행해주세요.', 'error')
      return
    }

    setIsSubmitting(true)
    console.log('회원 추가 프로세스 시작')

    try {
      // 회원가입 API 호출
      console.log('회원가입 API 호출 시작')
      const signupData = {
        name: formData.name,
        authId: formData.authId,
        password: formData.password,
        companyId: company.id,
        role: 'USER' as const
      }
      console.log('회원가입 요청 데이터:', signupData)

      const signupResponse = await signup(signupData)

      if (signupResponse.status !== 'success') {
        console.error('회원가입 API 실패:', signupResponse)
        throw new Error(signupResponse.message || '회원가입에 실패했습니다.')
      }

      console.log('회원가입 성공:', signupResponse)
      showToast('회사 멤버가 추가되었습니다.', 'success')
      handleCloseDialog()
      fetchMembers() // 멤버 목록 새로고침
    } catch (error) {
      console.error('회원 추가 프로세스 실패:', error)
      showToast(
        error instanceof Error
          ? error.message
          : '회원 추가에 실패했습니다. 다시 시도해주세요.',
        'error'
      )
    } finally {
      setIsSubmitting(false)
      console.log('회원 추가 프로세스 종료')
    }
  }

  const handleToggleMemberStatus = async (
    memberId: number,
    currentStatus: boolean
  ) => {
    setMemberToDelete(memberId)
    setShowDeleteConfirmDialog(true)
  }

  const confirmToggleMemberStatus = async () => {
    if (!memberToDelete) return
    try {
      await companyService.updateMemberStatus(
        memberToDelete,
        !members.find(m => m.id === memberToDelete)?.isDeleted
      )
      showToast('회사 멤버 상태가 변경되었습니다.', 'success')
      const updatedMembers = await companyService.getCompanyMembers(company.id)
      setMembers(updatedMembers)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || '회사 멤버 상태 변경에 실패했습니다.'
      showToast(errorMessage, 'error')
    } finally {
      setShowDeleteConfirmDialog(false)
      setMemberToDelete(null)
    }
  }

  const handleMemberClick = (memberId: number) => {
    navigate(`/admin/accounts/${memberId}`)
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Building2
              size={32}
              color="#000000"
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#000000',
                letterSpacing: '-0.5px'
              }}>
              {company.name}
            </Typography>
          </Box>
          {isEditable && (
            <Stack
              direction="row"
              spacing={2}>
              <Button
                startIcon={<Pencil size={18} />}
                variant="contained"
                size="medium"
                onClick={onEdit}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                수정
              </Button>
              <Button
                startIcon={<Trash2 size={18} />}
                variant="outlined"
                color="error"
                size="medium"
                onClick={onDelete}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}>
                삭제
              </Button>
            </Stack>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid
          container
          spacing={4}>
          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <User
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  대표자
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.ownerName || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Phone
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  전화번호
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.phoneNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <FileText
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  사업자번호
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.companyNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <MapPin
                size={24}
                color="#000000"
              />
              <Box sx={{ flex: 1 }}>
                <Grid
                  container
                  spacing={2}>
                  <Grid
                    item
                    xs={12}
                    md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}>
                      주소
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500 }}>
                      {company.address || '-'}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}>
                      상세주소
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500 }}>
                      {company.detailAddress || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Users
              size={32}
              color="#000000"
            />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: '#000000',
                letterSpacing: '-0.5px'
              }}>
              회사 멤버
            </Typography>
          </Box>
          {isEditable && (
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              onClick={handleAddMember}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
              계정 생성
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : members.length === 0 ? (
          <Typography color="text.secondary">
            등록된 멤버가 없습니다.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>아이디</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>직책</TableCell>
                  <TableCell>전화번호</TableCell>
                  <TableCell align="center">상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(member => (
                  <TableRow
                    key={member.id}
                    onClick={() => handleMemberClick(member.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {member.name.charAt(0)}
                        </Avatar>
                        {member.name}
                      </Box>
                    </TableCell>
                    <TableCell>{member.authId}</TableCell>
                    <TableCell>
                      {member.email ? (
                        <Typography
                          variant="body2"
                          color="text.primary">
                          {member.email}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary">
                          미등록
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.position ? (
                        <Typography
                          variant="body2"
                          color="text.primary">
                          {member.position}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary">
                          미지정
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.phoneNumber ? (
                        <Typography
                          variant="body2"
                          color="text.primary">
                          {member.phoneNumber}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary">
                          미등록
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={member.isDeleted ? '비활성화' : '활성화'}>
                        <Switch
                          checked={!member.isDeleted}
                          onChange={e => {
                            e.stopPropagation()
                            handleToggleMemberStatus(
                              member.id,
                              !member.isDeleted
                            )
                          }}
                          color="primary"
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={addMemberDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: '760px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            height: 'auto',
            borderRadius: 3
          }
        }}>
        <DialogTitle
          sx={{
            pb: 2,
            pt: 3,
            px: 4,
            bgcolor: 'grey.50',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                letterSpacing: '-1px'
              }}>
              회사 멤버 추가
            </Typography>
            <IconButton
              onClick={handleCloseDialog}
              size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            pt: 0,
            pb: 0,
            height: 'auto',
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto',
            background: 'transparent'
          }}>
          <Box
            component="form"
            id="add-member-form"
            onSubmit={handleSubmitMember}
            sx={{
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 0
            }}>
            <Stack
              spacing={2}
              sx={{ p: 2 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  mt: 0
                }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: '-0.5px',
                    fontSize: 20
                  }}>
                  기본 정보
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    name="name"
                    label="이름"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        fontSize: 18
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: 'grey.700',
                        fontSize: 16
                      }
                    }}
                  />
                  <TextField
                    name="authId"
                    label="아이디"
                    value={formData.authId}
                    onChange={handleInputChange}
                    error={!!authIdError}
                    helperText={
                      <Box
                        sx={{
                          minHeight: '20px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                        {authIdError ||
                          (isIdChecked && isIdAvailable
                            ? '사용 가능한 아이디입니다.'
                            : ' ')}
                      </Box>
                    }
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        fontSize: 18
                      },
                      '& .MuiInputBase-input': {
                        height: '48px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 18
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: 'grey.700',
                        fontSize: 16
                      },
                      '& .MuiFormHelperText-root': {
                        margin: '4px 0 0 0',
                        fontSize: '14px'
                      },
                      '& .MuiInputAdornment-root': {
                        marginRight: 0
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() =>
                              checkAuthIdAvailability(formData.authId)
                            }
                            disabled={
                              isCheckingAuthId || !formData.authId.trim()
                            }
                            variant="outlined"
                            color="primary"
                            sx={{
                              minWidth: '90px',
                              height: '32px',
                              mr: -1,
                              borderRadius: 1,
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}>
                            {isCheckingAuthId ? (
                              <CircularProgress size={20} />
                            ) : isIdAvailable === true ? (
                              <Check
                                size={20}
                                color="#4CAF50"
                              />
                            ) : isIdAvailable === false ? (
                              <X size={20} />
                            ) : (
                              '중복확인'
                            )}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                </Stack>
              </Paper>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  mt: 1
                }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: '-0.5px',
                    fontSize: 20
                  }}>
                  비밀번호
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    name="password"
                    label="비밀번호"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!passwordError}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        fontSize: 18
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: 'grey.700',
                        fontSize: 16
                      }
                    }}
                  />
                  <TextField
                    name="confirmPassword"
                    label="비밀번호 확인"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        fontSize: 18
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: 'grey.700',
                        fontSize: 16
                      }
                    }}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            pb: 3,
            pt: 2,
            background: 'grey.50',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.03)'
          }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end'
            }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                minWidth: 140,
                height: 48,
                borderRadius: 2,
                borderColor: 'divider',
                fontWeight: 700,
                fontSize: 16,
                bgcolor: 'grey.100',
                color: 'grey.700',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'grey.200'
                }
              }}>
              취소
            </Button>
            <Button
              type="submit"
              form="add-member-form"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={22} /> : <Save />
              }
              sx={{
                minWidth: 140,
                height: 48,
                borderRadius: 2,
                fontWeight: 800,
                fontSize: 16,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}>
              {isSubmitting ? '추가 중...' : '추가'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}>
        <DialogTitle>멤버 상태 변경</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 멤버의 상태를 변경하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmDialog(false)}>
            취소
          </Button>
          <Button
            onClick={confirmToggleMemberStatus}
            color="primary"
            variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CompanyDetail
