import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Stack,
  TextField,
  IconButton
} from '@mui/material'
import {
  Building2,
  Phone,
  FileText,
  MapPin,
  User,
  ArrowLeft,
  Save
} from 'lucide-react'
import { companyService } from '../../../services/companyService'
import { useToast } from '../../../contexts/ToastContext'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { CompanyFormData } from '../../../types/company'

const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    phoneNumber: '',
    companyNumber: '',
    address: '',
    detailAddress: '',
    ownerName: ''
  })

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!id) return
        const data = await companyService.getCompanyById(Number(id))
        setFormData({
          name: data.name,
          phoneNumber: data.phoneNumber || '',
          companyNumber: data.companyNumber || '',
          address: data.address || '',
          detailAddress: data.detailAddress || '',
          ownerName: data.ownerName || ''
        })
      } catch (error) {
        console.error('회사 정보 조회 중 오류:', error)
        setError('회사 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsSubmitting(true)
    try {
      await companyService.updateCompany(Number(id), formData)
      showToast('회사 정보가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/companies/${id}`)
    } catch (error) {
      console.error('회사 수정 중 오류:', error)
      showToast('회사 수정 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/admin/companies/${id}`)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

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
              회사 정보 수정
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={2}>
            <Button
              startIcon={<ArrowLeft size={18} />}
              variant="outlined"
              onClick={handleCancel}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}>
              취소
            </Button>
            <Button
              startIcon={<Save size={18} />}
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
              저장
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={4}>
            <Grid
              item
              xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                <Building2
                  size={24}
                  color="#000000"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}>
                    회사명
                  </Typography>
                  <TextField
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="회사명을 입력하세요"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                <User
                  size={24}
                  color="#000000"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}>
                    대표자
                  </Typography>
                  <TextField
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="대표자 이름을 입력하세요"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                <Phone
                  size={24}
                  color="#000000"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}>
                    전화번호
                  </Typography>
                  <TextField
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="010-0000-0000"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                <FileText
                  size={24}
                  color="#000000"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}>
                    사업자번호
                  </Typography>
                  <TextField
                    name="companyNumber"
                    value={formData.companyNumber}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="000-00-00000"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
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
                      <TextField
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="주소를 입력하세요"
                      />
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
                      <TextField
                        name="detailAddress"
                        value={formData.detailAddress}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="상세주소를 입력하세요"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default EditCompany
