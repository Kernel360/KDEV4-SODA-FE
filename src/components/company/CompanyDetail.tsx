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
  Tooltip
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
  Save
} from 'lucide-react'
import { companyService } from '../../services/companyService'
import { signup } from '../../api/auth'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { validatePassword } from '../../utils/validation'

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

    const passwordValidation = validatePassword(
      formData.password,
      DEFAULT_PASSWORD_POLICY
    )
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message)
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  const checkAuthIdAvailability = async (authId: string) => {
    if (!authId) return
    setIsCheckingAuthId(true)
    setAuthIdError(null)
    try {
      const response = await companyService.checkAuthIdAvailability(authId)
      if (!response.available) {
        setAuthIdError('이미 사용 중인 아이디입니다.')
      }
    } catch (err) {
      setAuthIdError('아이디 중복 확인 중 오류가 발생했습니다.')
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
      const debouncedCheck = setTimeout(() => {
        checkAuthIdAvailability(value)
      }, 500)
      return () => clearTimeout(debouncedCheck)
    }

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError(null)
    }
  }

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    const isValid = validateFormData()
    if (!isValid) {
      setPasswordError('비밀번호 정책을 확인하세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const signupData = {
        authId: formData.authId,
        password: formData.password,
        name: formData.name,
        role: 'USER' as 'USER'
      }

      await signup(signupData)
      await companyService.addCompanyMember(company.id, {
        name: formData.name,
        position: formData.position || undefined,
        phoneNumber: formData.phoneNumber || undefined
      })

      showToast('회원이 성공적으로 추가되었습니다.', 'success')
      setAddMemberDialogOpen(false)
      setFormData({
        authId: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        position: '',
        phoneNumber: ''
      })
      setPasswordError(null)
      fetchMembers()
    } catch (error) {
      console.error('회원 추가 중 오류:', error)
      showToast('회원 추가 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSubmitting(false)
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
              멤버 추가
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
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            회사 멤버 추가
            <IconButton
              onClick={handleCloseDialog}
              size="small">
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="이름"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="authId"
              label="아이디"
              value={formData.authId}
              onChange={handleInputChange}
              error={!!authIdError}
              helperText={authIdError || (isCheckingAuthId ? '확인 중...' : '')}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="email"
              label="이메일"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              name="position"
              label="직책"
              value={formData.position}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              name="phoneNumber"
              label="전화번호"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              fullWidth
              size="small"
              placeholder="010-0000-0000"
            />
            <TextField
              name="password"
              label="비밀번호"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!passwordError}
              helperText={
                passwordError || '8자 이상, 특수문자, 숫자, 대문자 포함'
              }
              fullWidth
              required
              size="small"
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
              size="small"
            />
            <TextField
              label="회사"
              value={company.name}
              fullWidth
              disabled
              size="small"
            />
            <TextField
              label="계정 유형"
              value="일반 사용자"
              fullWidth
              disabled
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}>
            취소
          </Button>
          <Button
            onClick={handleSubmitMember}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}>
            추가
          </Button>
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
