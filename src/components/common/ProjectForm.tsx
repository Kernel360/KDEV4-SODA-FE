import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Paper,
  IconButton,
  Card,
  Chip,
  Tooltip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Grid
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { X, User, Users, Check } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { Company, Member } from '../../types/api'

interface ProjectFormProps {
  companies: Company[]
  members: Member[]
  onSubmit: (data: any) => void
  isEdit?: boolean
  initialData?: any
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  companies,
  members,
  onSubmit,
  isEdit = false,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: null as dayjs.Dayjs | null,
    endDate: null as dayjs.Dayjs | null,
    companies: [] as number[],
    members: [] as number[]
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? dayjs(initialData.startDate) : null,
        endDate: initialData.endDate ? dayjs(initialData.endDate) : null,
        companies: initialData.companies?.map((c: Company) => c.id) || [],
        members: initialData.members?.map((m: Member) => m.id) || []
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: dayjs.Dayjs | null) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (event: SelectChangeEvent<number[]>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="프로젝트 이름"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="프로젝트 설명"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="시작일"
            value={formData.startDate}
            onChange={(value) => handleDateChange('startDate', value)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="종료일"
            value={formData.endDate}
            onChange={(value) => handleDateChange('endDate', value)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>관련 회사</InputLabel>
            <Select
              multiple
              value={formData.companies}
              onChange={handleSelectChange}
              input={<OutlinedInput label="관련 회사" />}
              name="companies"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={companies.find(c => c.id === value)?.name}
                    />
                  ))}
                </Box>
              )}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>프로젝트 멤버</InputLabel>
            <Select
              multiple
              value={formData.members}
              onChange={handleSelectChange}
              input={<OutlinedInput label="프로젝트 멤버" />}
              name="members"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={members.find(m => m.id === value)?.name}
                    />
                  ))}
                </Box>
              )}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              {isEdit ? '수정' : '생성'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default ProjectForm
