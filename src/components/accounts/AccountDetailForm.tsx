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
  DialogActions,
  Typography,
  Grid
} from '@mui/material'
import { Save, X, Edit } from 'lucide-react'
import { getCompanies } from '../../api/admin'

// 계정 인터페이스 정의
export interface Account {
  id: number
  authId: string
  name: string
  email: string
  role: string
  companyId?: number
  companyName?: string
  position?: string
  phoneNumber?: string
  createdAt?: string
  updatedAt?: string
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
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

  const renderField = (label: string, value: string | number | undefined) => {
    if (isEditing) {
      return (
        <TextField
          fullWidth
          label={label}
          value={value || ''}
          disabled={!isEditing}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
              backgroundColor: 'transparent'
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      )
    }
    return (
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: 500 }}>
          {value || '-'}
        </Typography>
      </Box>
    )
  }

  const renderSelectField = (
    label: string,
    value: string | number | undefined,
    options: { value: string | number; label: string }[],
    name: string
  ) => {
    if (isEditing) {
      return (
        <TextField
          fullWidth
          select
          label={label}
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={!isEditing}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
              backgroundColor: 'transparent'
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
          SelectProps={{
            native: true,
            MenuProps: {
              PaperProps: {
                sx: {
                  borderRadius: 2
                }
              }
            }
          }}>
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
      )
    }
    const selectedOption = options.find(opt => opt.value === value)
    return (
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: 500 }}>
          {selectedOption?.label || '-'}
        </Typography>
      </Box>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={4}>
        <Box>
          <Grid
            container
            spacing={3}>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('이름', formData.name)}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('아이디', formData.authId)}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('이메일', formData.email)}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('전화번호', formData.phoneNumber)}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('회사', formData.companyName)}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}>
              {renderField('직책', formData.position)}
            </Grid>
            <Grid
              item
              xs={12}>
              {renderSelectField(
                '역할',
                formData.role,
                [
                  { value: 'USER', label: '일반 사용자' },
                  { value: 'ADMIN', label: '관리자' }
                ],
                'role'
              )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {!isEditing ? (
            <Button
              variant="contained"
              onClick={handleEdit}
              startIcon={<Edit />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1
              }}>
              수정
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<X />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1
                }}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1
                }}>
                저장
              </Button>
            </>
          )}
        </Box>
      </Stack>

      {/* 수정사항 확인 모달 */}
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
