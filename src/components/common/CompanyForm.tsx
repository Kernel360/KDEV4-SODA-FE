import React, { useState } from 'react'
import { Box, Button, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Company } from '../../types/company'

interface CompanyFormData {
  name: string
  ceoName: string
  ceoPhone: string
  registrationNumber: string
  address: string
  addressDetail: string
}

interface CompanyFormProps {
  initialData?: CompanyFormData
  onSubmit: (data: CompanyFormData) => Promise<void>
}

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>(
    initialData || {
      name: '',
      ceoName: '',
      ceoPhone: '',
      registrationNumber: '',
      address: '',
      addressDetail: ''
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="회사명"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="대표자명"
        name="ceoName"
        value={formData.ceoName}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="대표자 연락처"
        name="ceoPhone"
        value={formData.ceoPhone}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="사업자등록번호"
        name="registrationNumber"
        value={formData.registrationNumber}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="주소"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="상세주소"
        name="addressDetail"
        value={formData.addressDetail}
        onChange={handleChange}
        required
        margin="normal"
      />
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleCancel}>
          {initialData ? '수정 취소' : '생성 취소'}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary">
          {initialData ? '수정' : '생성'}
        </Button>
      </Box>
    </Box>
  )
}

export default CompanyForm
