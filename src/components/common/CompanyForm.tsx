import { useState, useEffect } from 'react'
import { Box, Paper, TextField, Button, Grid, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CompanyFormData } from '../../types/company'

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void
  initialData?: CompanyFormData
}

const CompanyForm = ({ onSubmit, initialData }: CompanyFormProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    phoneNumber: '',
    companyNumber: '',
    address: '',
    detailAddress: '',
    ownerName: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const formatCompanyNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'phoneNumber') {
      formattedValue = formatPhoneNumber(value)
    } else if (name === 'companyNumber') {
      formattedValue = formatCompanyNumber(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs={12}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                required
                label="회사명"
                name="name"
                value={formData.name}
                onChange={handleChange}
                inputProps={{
                  maxLength: 50
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -20,
                  color: 'text.secondary'
                }}>
                {`${formData.name.length}/50`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                required
                label="대표자명"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                inputProps={{
                  maxLength: 20
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -20,
                  color: 'text.secondary'
                }}>
                {`${formData.ownerName.length}/20`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                required
                label="연락처"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                inputProps={{
                  maxLength: 13
                }}
                placeholder="010-1234-5678"
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -20,
                  color: 'text.secondary'
                }}>
                {`${formData.phoneNumber.replace(/[^\d]/g, '').length}/11`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                required
                label="사업자등록번호"
                name="companyNumber"
                value={formData.companyNumber}
                onChange={handleChange}
                inputProps={{
                  maxLength: 12
                }}
                placeholder="○○○-○○-○○○○○"
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -20,
                  color: 'text.secondary'
                }}>
                {`${formData.companyNumber.replace(/[^\d]/g, '').length}/10`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                required
                label="주소"
                name="address"
                value={formData.address}
                onChange={handleChange}
                inputProps={{
                  maxLength: 100
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -20,
                  color: 'text.secondary'
                }}>
                {`${formData.address.length}/100`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="상세주소를 입력하세요"
                inputProps={{ maxLength: 50 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                {`${formData.detailAddress.length}/50`}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 3
              }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  minWidth: 100
                }}>
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  minWidth: 100
                }}>
                저장
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export default CompanyForm
