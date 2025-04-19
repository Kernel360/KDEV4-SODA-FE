import React from 'react'
import { Box, TextField, Button, Stack } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

interface ProjectFormData {
  name: string
  description: string
  startDate: dayjs.Dayjs | null
  endDate: dayjs.Dayjs | null
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void
  initialData?: Partial<ProjectFormData>
  isEdit?: boolean
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  initialData = {},
  isEdit = false
}) => {
  const [formData, setFormData] = React.useState<ProjectFormData>({
        name: initialData.name || '',
        description: initialData.description || '',
    startDate: initialData.startDate || null,
    endDate: initialData.endDate || null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
      <TextField
          label="프로젝트명"
        value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        fullWidth
      />

      <TextField
          label="설명"
        value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        multiline
        rows={4}
        fullWidth
      />

        <DatePicker
          label="시작일"
          value={formData.startDate}
          onChange={date => setFormData({ ...formData, startDate: date })}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <DatePicker
          label="종료일"
          value={formData.endDate}
          onChange={date => setFormData({ ...formData, endDate: date })}
          slotProps={{ textField: { fullWidth: true } }}
                      />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          {isEdit ? '수정하기' : '생성하기'}
        </Button>
      </Stack>
    </Box>
  )
}

export default ProjectForm
