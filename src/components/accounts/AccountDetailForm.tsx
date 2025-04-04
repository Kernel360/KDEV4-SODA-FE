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
  DialogActions
} from '@mui/material'
import { Save, Lock } from 'lucide-react'

// 계정 인터페이스 정의
export interface Account {
  id: string
  name: string
  username: string
  companyName: string
  position: string
  isActive: boolean
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
}

export default function AccountDetailForm({
  account,
  loading,
  error,
  success,
  isAdmin = false,
  onSave,
  onPasswordChange,
  onCancel
}: AccountDetailFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>(account || {})
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // 계정 데이터가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    setFormData(account || {})
    setHasChanges(false)
  }, [account])

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
  const handleSave = async () => {
    await onSave(formData)
    setHasChanges(false)
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
      onCancel?.()
    }
  }

  // 확인 모달에서 취소 확인
  const handleConfirmCancel = () => {
    setShowConfirmDialog(false)
    onCancel?.()
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
          />
          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={formData.username || ''}
            onChange={handleChange}
            disabled={!isAdmin}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}>
          <TextField
            fullWidth
            label="회사"
            name="companyName"
            value={formData.companyName || ''}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="직책"
            name="position"
            value={formData.position || ''}
            onChange={handleChange}
          />
        </Stack>

        {isAdmin && (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive || false}
                  onChange={handleChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="계정 활성화"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {onPasswordChange && (
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setShowPasswordForm(!showPasswordForm)}>
              비밀번호 변경
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '저장'}
          </Button>
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
