import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Save, X, Edit } from 'lucide-react'
import { getCompanies } from '../../api/admin'

// 계정 인터페이스 정의
export interface Account {
  id: number
  name: string
  email: string
  role: string
  companyId?: number
  position?: string
  phoneNumber?: string
  deleted: boolean
}

interface AccountDetailFormProps {
  account: Partial<Account>
  loading?: boolean
  error?: string | null
  success?: string | null
  isAdmin?: boolean
  onSave?: (formData: Partial<Account>) => void
  onCancel?: () => void
  onPasswordChange?: () => void
  onToggleActive?: () => void
}

export default function AccountDetailForm({
  account,
  loading,
  error,
  success,
  isAdmin = false,
  onSave,
  onCancel
}: AccountDetailFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    email: '',
    role: 'USER',
    companyId: undefined,
    position: '',
    phoneNumber: '',
    deleted: false
  })
  const [isEditing, setIsEditing] = useState(false)
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    if (!name) return

    // 회사 선택 시
    if (name === 'companyId') {
      const companyId = value === '' ? undefined : Number(value)
      console.log('Selected Company ID:', companyId)
      setFormData(prev => ({
        ...prev,
        companyId
      }))
    } else {
      // 다른 필드 변경 시
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setHasChanges(true)
  }

  // 계정 정보 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form data:', formData)
    await onSave?.(formData)
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
            name="companyId"
            value={formData.companyId || ''}
            onChange={handleChange}
            disabled={!isEditing || !isAdmin || loadingCompanies}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'transparent'
              }
            }}
            SelectProps={{
              native: true,
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300
                  }
                }
              }
            }}>
            <option value="">회사를 선택하세요</option>
            {companies.map(company => (
              <option
                key={company.id}
                value={company.id}>
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
      </Stack>

      {/* 수정사항 확인 모달 */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>수정사항이 있습니다</DialogTitle>
        <DialogContent>
          저장하지 않은 수정사항이 있습니다. 정말로 나가시겠습니까?
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
