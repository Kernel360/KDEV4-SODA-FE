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
  DialogActions
} from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import { getUserDetail, updateUserStatus, updateUser } from '../../../api/admin'
import AccountDetailForm from '../../../components/accounts/AccountDetailForm'
import type { Account } from '../../../components/accounts/AccountDetailForm'


interface AccountDetailProps {
  isAdmin?: boolean
}

export default function AccountDetail({ isAdmin = true }: AccountDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [account, setAccount] = useState<Partial<Account> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    role: string
    companyId: number
    position: string
    phoneNumber: string
  }>({
    name: '',
    email: '',
    role: '',
    companyId: 0,
    position: '',
    phoneNumber: ''
  })

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true)
        const response = await getUserDetail(Number(id))
        if (response.status === 'success' && response.data) {
          setAccount(response.data)
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            role: response.data.role || '',
            companyId: response.data.companyId || 0,
            position: response.data.position || '',
            phoneNumber: response.data.phoneNumber || ''
          })
        } else {
          setError(response.message || '사용자 정보를 불러오는데 실패했습니다.')
          showToast('사용자 정보를 불러오는데 실패했습니다.', 'error')
        }
      } catch (err) {
        console.error('사용자 정보 조회 중 오류:', err)
        setError('사용자 정보를 불러오는데 실패했습니다.')
        showToast('사용자 정보를 불러오는데 실패했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserDetail()
    }
  }, [id, showToast])

  const handleSave = async () => {
    try {
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

  const handlePasswordChange = async () => {
    try {
      // TODO: Implement password change API
      showToast('비밀번호가 성공적으로 변경되었습니다.', 'success')
    } catch (err) {
      console.error('비밀번호 변경 중 오류:', err)
      showToast('비밀번호 변경에 실패했습니다.', 'error')
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
      navigate(isAdmin ? '/admin/accounts' : '/user/accounts')
    }
  }

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false)
    navigate(isAdmin ? '/admin/accounts' : '/user/accounts')
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
          alignItems: 'center',
          mb: 3,
          gap: 1
        }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={handleCancel}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}>
          목록으로
        </Button>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 600 }}>
          계정 상세 정보
        </Typography>
      </Box>

      {account && (
        <AccountDetailForm
          account={account}
          loading={false}
          error={error}
          success={success}
          isAdmin={isAdmin}
          onSave={handleSave}
          onPasswordChange={handlePasswordChange}
          onCancel={handleCancel}
          onToggleActive={() => account.id && handleToggleActive(account.id, !account.deleted)}
        />
      )}

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
    </Box>
  )
}
