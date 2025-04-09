import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  Paper
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { getCompanyList } from '@/api/company'
import { signup } from '@/api/auth'
import { useToast } from '@/contexts/ToastContext'
import type { CompanyListItem } from '@/types/api'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [formData, setFormData] = useState({
    name: '',
    authId: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'ADMIN',
    companyId: ''
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList()
      if (response.status === 'success' && response.data) {
        setCompanies(response.data)
      } else {
        showToast(response.message || '회사 목록을 불러오는데 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'role' && value === 'ADMIN') {
        newData.companyId = ''
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.authId || !formData.password || !formData.confirmPassword || (formData.role === 'USER' && !formData.companyId)) {
      showToast('모든 필수 항목을 입력해주세요.', 'error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('비밀번호가 일치하지 않습니다.', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await signup({
        name: formData.name,
        authId: formData.authId,
        password: formData.password,
        role: formData.role,
        companyId: formData.role === 'ADMIN' ? 0 : Number(formData.companyId)
      })

      if (response.status === 'success') {
        showToast('계정이 성공적으로 생성되었습니다.', 'success')
        navigate('/admin/accounts')
      } else {
        showToast(response.message || '계정 생성에 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('계정 생성 중 오류:', err)
      showToast('계정 생성에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ 
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          gap: 1
        }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/admin/accounts')}
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
          새 계정 생성
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            '& .MuiTextField-root': { mb: 3 },
            '& .MuiFormControl-root': { mb: 3 }
          }}>
          <Stack spacing={3} sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            <TextField
              fullWidth
              label="아이디"
              name="authId"
              value={formData.authId}
              onChange={handleInputChange}
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            <FormControl
              fullWidth
              size="small"
              disabled={formData.role === 'ADMIN'}>
              <InputLabel>회사</InputLabel>
              <Select
                name="companyId"
                value={formData.companyId}
                onChange={handleSelectChange}
                required={formData.role === 'USER'}
                sx={{
                  borderRadius: 1
                }}>
                {companies.map(company => (
                  <MenuItem
                    key={company.id}
                    value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                계정 유형
              </Typography>
              <RadioGroup
                name="role"
                value={formData.role}
                onChange={handleSelectChange}>
                <FormControlLabel
                  value="USER"
                  control={<Radio />}
                  label="일반 사용자"
                />
                <FormControlLabel
                  value="ADMIN"
                  control={<Radio />}
                  label="관리자"
                />
              </RadioGroup>
            </FormControl>

            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                mt: 'auto'
              }}>
              <Button
                variant="outlined"
                startIcon={<X />}
                onClick={() => navigate('/admin/accounts')}
                disabled={loading}
                sx={{
                  minWidth: 100,
                  borderRadius: 1
                }}>
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
                sx={{
                  minWidth: 100,
                  bgcolor: 'black',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.8)'
                  }
                }}>
                {loading ? '생성 중...' : '생성'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
