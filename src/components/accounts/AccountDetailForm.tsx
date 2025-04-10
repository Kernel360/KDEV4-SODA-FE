import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material'
import { Save, Lock, X, Edit } from 'lucide-react'
import { getCompanies } from '../../api/admin'

// 계정 인터페이스 정의
export interface Account {
  id: string
  name: string
  username: string
  companyName: string
  position: string
  isActive: boolean
  email: string
  phoneNumber: string
  role: string
}

interface AccountDetailFormProps {
  account: Account | null
  loading: boolean
  error: string | null
  success: string | null
  isAdmin?: boolean
  onSave: (formData: Partial<Account>) => Promise<void>
  onPasswordChange?: (passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => Promise<void>
  onCancel?: () => void
  onToggleActive?: () => Promise<void>
}

export default function AccountDetailForm({
  account,
  loading,
  error,
  success,
  isAdmin = false,
  onSave,
  onPasswordChange,
  onCancel,
  onToggleActive
}: AccountDetailFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    position: '',
    role: 'USER'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  // 계정 데이터가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (account) {
      setFormData(account)
    }
  }, [account])

  // 회사 목록 조회
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true)
        const response = await getCompanies()
        if (response.status === 'success') {
          setCompanies(response.data)
        }
      } catch (err) {
        console.error('회사 목록 조회 중 오류:', err)
      } finally {
        setLoadingCompanies(false)
      }
    }

    if (isAdmin) {
      fetchCompanies()
    }
  }, [isAdmin])

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }))
    setHasChanges(true)
  }

  // 비밀번호 폼 데이터 변경 핸들러
  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 계정 정보 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  // 비밀번호 변경 핸들러
  const handlePasswordSubmit = async () => {
    // 비밀번호 유효성 검사
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('새 비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    setPasswordError(null)

    if (onPasswordChange) {
      await onPasswordChange(passwordData)
      setShowPasswordForm(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      // 원래 데이터로 복원하고 비활성화 상태로 변경
      setFormData(account || {})
      setIsEditing(false)
      setHasChanges(false)
    }
  }

  // 취소 확인 핸들러
  const handleConfirmCancel = () => {
    setShowConfirmDialog(false)
    // 원래 데이터로 복원하고 비활성화 상태로 변경
    setFormData(account || {})
    setIsEditing(false)
    setHasChanges(false)
    // 목록으로 이동
    onCancel?.()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}>
          <TextField
            fullWidth
            label="이름"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            disabled={!isEditing}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
          />
          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={formData.username || ''}
            onChange={handleChange}
            disabled={!isEditing || !isAdmin}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}>
          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            disabled={!isEditing}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
          />
          <TextField
            fullWidth
            label="전화번호"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            disabled={!isEditing}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}>
          <TextField
            fullWidth
            select
            label="회사"
            name="companyName"
            value={formData.companyName || ''}
            onChange={handleChange}
            disabled={!isEditing || !isAdmin || loadingCompanies}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
            SelectProps={{
              native: true
            }}>
            <option value="">회사를 선택하세요</option>
            {companies.map(company => (
              <option
                key={company.id}
                value={company.name}>
                {company.name}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="직책"
            name="position"
            value={formData.position || ''}
            onChange={handleChange}
            disabled={!isEditing}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
          />
        </Stack>

        {isAdmin && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}>
            <TextField
              fullWidth
              select
              label="역할"
              name="role"
              value={formData.role || 'USER'}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  backgroundColor: 'transparent'
                },
                maxWidth: '200px'
              }}
              SelectProps={{
                native: true
              }}>
              <option value="USER">일반 사용자</option>
              <option value="ADMIN">관리자</option>
            </TextField>
          </Stack>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {!isEditing ? (
            <Button
              variant="contained"
              onClick={handleEdit}
              startIcon={<Edit />}>
              수정
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<X />}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
                disabled={loading}>
                저장
              </Button>
            </>
          )}
        </Box>

        {showPasswordForm && onPasswordChange && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="h6"
              sx={{ mb: 2 }}>
              비밀번호 변경
            </Typography>
            {passwordError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}>
                <TextField
                  fullWidth
                  label="현재 비밀번호"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                />
                <TextField
                  fullWidth
                  label="새 비밀번호"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                />
                <TextField
                  fullWidth
                  label="새 비밀번호 확인"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handlePasswordSubmit}
                  disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : '비밀번호 변경'}
                </Button>
              </Box>
            </Stack>
          </>
        )}
      </Stack>

      {/* 수정사항 확인 모달 */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>수정사항 저장</DialogTitle>
        <DialogContent>
          <Typography>
            수정사항이 있습니다. 저장하지 않고 나가시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>취소</Button>
          <Button
            onClick={handleConfirmCancel}
            color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
