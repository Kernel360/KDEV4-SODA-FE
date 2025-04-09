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
import AccountDetailForm, {
  Account
} from '../../../components/accounts/AccountDetailForm'

// 더미 데이터
const dummyAccounts: Account[] = [
  {
    id: '1',
    name: '김개발',
    username: 'dev.kim',
    companyName: '테크솔루션',
    position: '개발자',
    isActive: true
  },
  {
    id: '2',
    name: '이매니저',
    username: 'manager.lee',
    companyName: '클라우드시스템',
    position: '매니저',
    isActive: true
  },
  {
    id: '3',
    name: '박디자인',
    username: 'design.park',
    companyName: '디자인스튜디오',
    position: '디자이너',
    isActive: false
  }
]

interface AccountDetailProps {
  isAdmin?: boolean
}

export default function AccountDetail({ isAdmin = true }: AccountDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 계정 데이터 가져오기
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)
        // 실제로는 API 호출을 통해 데이터를 가져와야 함
        // 여기서는 더미 데이터를 사용
        const foundAccount = dummyAccounts.find(acc => acc.id === id)

        if (foundAccount) {
          setAccount(foundAccount)
        } else {
          setError('계정을 찾을 수 없습니다.')
        }
      } catch (err) {
        setError('계정 정보를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [id])

  // 계정 정보 저장 핸들러
  const handleSave = async (formData: Partial<Account>) => {
    try {
      setLoading(true)
      // 실제로는 API 호출을 통해 데이터를 저장해야 함
      console.log('저장할 데이터:', formData)

      // 성공 메시지 표시
      setSuccess('계정 정보가 성공적으로 저장되었습니다.')

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError('계정 정보를 저장하는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async (passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      setLoading(true)
      // 실제로는 API 호출을 통해 비밀번호를 변경해야 함
      console.log('비밀번호 변경:', passwordData)

      // 성공 메시지 표시
      setSuccess('비밀번호가 성공적으로 변경되었습니다.')

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError('비밀번호를 변경하는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 돌아가기 핸들러
  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      navigate(isAdmin ? '/admin/accounts' : '/user/accounts')
    }
  }

  // 확인 모달에서 돌아가기 확인
  const handleConfirmBack = () => {
    setShowConfirmDialog(false)
    navigate(isAdmin ? '/admin/accounts' : '/user/accounts')
  }

  if (loading && !account) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() =>
            navigate(isAdmin ? '/admin/accounts' : '/user/accounts')
          }
          sx={{ mt: 2 }}>
          계정 목록으로 돌아가기
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          sx={{ mr: 2 }}>
          돌아가기
        </Button>
        <Typography
          variant="h5"
          component="h1">
          계정 상세 정보
        </Typography>
      </Box>

      <AccountDetailForm
        account={account}
        loading={loading}
        error={error}
        success={success}
        isAdmin={isAdmin}
        onSave={handleSave}
        onPasswordChange={handlePasswordChange}
      />

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
            onClick={handleConfirmBack}
            color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
