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
  CircularProgress,
  Stack,
  Paper,
  InputAdornment,
  Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X, Search, Check, X as XIcon } from 'lucide-react'
import { getCompanyList } from '../../../api/company'
import { signup, checkIdAvailability } from '../../../api/auth'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'
import { CompanySearchModal } from '../../../components/modals/CompanySearchModal'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyListItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    authId: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'ADMIN',
    companyId: ''
  })
  const [isCheckingId, setIsCheckingId] = useState(false)
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList({
        view: 'ACTIVE',
        page: 0,
        size: 1000
      })

      if (response.status === 'success' && response.data?.content) {
        console.log('회사 목록 API 응답:', response)
        setCompanies(response.data.content)
      } else {
        console.error('회사 목록 API 응답 형식이 올바르지 않습니다:', response)
        showToast(
          response.message || '회사 목록을 불러오는데 실패했습니다.',
          'error'
        )
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  const handleCheckId = async () => {
    if (!formData.authId.trim()) {
      showToast('아이디를 입력해주세요.', 'error')
      return
    }

    try {
      setIsCheckingId(true)
      const response = await checkIdAvailability(formData.authId)
      if (response.status === 'success') {
        setIsIdAvailable(response.data)
        if (response.data) {
          showToast('사용 가능한 아이디입니다.', 'success')
        } else {
          showToast('이미 사용 중인 아이디입니다.', 'error')
        }
      } else {
        showToast(
          response.message || '아이디 중복 확인에 실패했습니다.',
          'error'
        )
      }
    } catch (error) {
      console.error('아이디 중복 확인 중 오류:', error)
      showToast('아이디 중복 확인에 실패했습니다.', 'error')
    } finally {
      setIsCheckingId(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'authId') {
      setIsIdAvailable(null) // 아이디가 변경되면 중복 확인 상태 초기화
    }
  }

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'role' && value === 'ADMIN') {
        newData.companyId = ''
        setSelectedCompany(null)
      }
      return newData
    })
  }

  const handleCompanySelect = (company: CompanyListItem) => {
    setSelectedCompany(company)
    setFormData(prev => ({ ...prev, companyId: String(company.id) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.authId ||
      !formData.password ||
      !formData.confirmPassword ||
      (formData.role === 'USER' && !formData.companyId)
    ) {
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
        companyId: formData.role === 'ADMIN' ? null : Number(formData.companyId)
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
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/accounts')}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' }
            }}></Button>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600 }}>
            새 계정 생성
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}>
          <Box
            component="form"
            onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 500 }}>
                  기본 정보
                </Typography>
                <Stack spacing={2}>
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
                        borderRadius: 1,
                        bgcolor: 'background.default'
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
                    error={isIdAvailable === false}
                    helperText={
                      isIdAvailable === false
                        ? '이미 사용 중인 아이디입니다.'
                        : isIdAvailable === true
                          ? '사용 가능한 아이디입니다.'
                          : ' '
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={handleCheckId}
                            disabled={isCheckingId || !formData.authId.trim()}
                            variant="outlined"
                            color="primary"
                            sx={{
                              minWidth: '90px',
                              height: '32px',
                              mr: -1,
                              borderRadius: 1
                            }}>
                            {isCheckingId ? (
                              <CircularProgress size={20} />
                            ) : isIdAvailable === true ? (
                              <Check
                                size={20}
                                color="#4CAF50"
                              />
                            ) : isIdAvailable === false ? (
                              <XIcon size={20} />
                            ) : (
                              '중복확인'
                            )}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      },
                      '& .MuiFormHelperText-root': {
                        minHeight: '20px',
                        margin: '3px 14px 0'
                      }
                    }}
                  />

                  {formData.role === 'USER' && (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, color: 'text.secondary' }}>
                        소속 회사
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setIsCompanyModalOpen(true)}
                        startIcon={<Search size={18} />}
                        sx={{
                          justifyContent: 'flex-start',
                          borderRadius: 1,
                          height: 40,
                          textTransform: 'none',
                          color: selectedCompany
                            ? 'text.primary'
                            : 'text.secondary',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover'
                          }
                        }}>
                        {selectedCompany ? selectedCompany.name : '회사 검색'}
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 500 }}>
                  비밀번호
                </Typography>
                <Stack spacing={2}>
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
                        borderRadius: 1,
                        bgcolor: 'background.default'
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
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 500 }}>
                  계정 유형
                </Typography>
                <FormControl>
                  <RadioGroup
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    row>
                    <FormControlLabel
                      value="USER"
                      control={<Radio />}
                      label="일반 사용자"
                      sx={{ mr: 4 }}
                    />
                    <FormControlLabel
                      value="ADMIN"
                      control={<Radio />}
                      label="관리자"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<X />}
                  onClick={() => navigate('/admin/accounts')}
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    height: 40,
                    borderRadius: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}>
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    height: 40,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}>
                  {loading ? '생성 중...' : '생성'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {isCompanyModalOpen && (
        <CompanySearchModal
          open={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          onSelect={handleCompanySelect}
        />
      )}
    </Box>
  )
}
