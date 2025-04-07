import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import type { CompanyListItem, CompanyMember } from '../../types/api'
import { getCompanyMembers } from '../../api/company'

interface CreateProjectFormProps {
  loading: boolean
  error: string | null
  success: string | null
  companies: CompanyListItem[]
  onSave: (formData: {
    name: string
    description: string
    startDate: string
    endDate: string
    clientCompanyId: string
    developmentCompanyId: string
    clientManagers: string[]
    clientParticipants: string[]
    developmentManagers: string[]
    developmentParticipants: string[]
  }) => void
  onCancel: () => void
}

export default function CreateProjectForm({
  loading,
  error,
  success,
  companies,
  onSave,
  onCancel
}: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientCompanyId: '',
    developmentCompanyId: '',
    clientManagers: [] as string[],
    clientParticipants: [] as string[],
    developmentManagers: [] as string[],
    developmentParticipants: [] as string[]
  })

  const [clientMembers, setClientMembers] = useState<CompanyMember[]>([])
  const [developmentMembers, setDevelopmentMembers] = useState<CompanyMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: string | null) => {
    setFormData(prev => ({ ...prev, [name]: date || '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  useEffect(() => {
    const fetchCompanyMembers = async (companyId: string, isClient: boolean) => {
      if (!companyId) return

      try {
        setLoadingMembers(true)
        const response = await getCompanyMembers(parseInt(companyId))
        if (response.status === 'success') {
          if (isClient) {
            setClientMembers(response.data)
          } else {
            setDevelopmentMembers(response.data)
          }
        }
      } catch (err) {
        console.error('회사 멤버 조회 중 오류:', err)
      } finally {
        setLoadingMembers(false)
      }
    }

    if (formData.clientCompanyId) {
      fetchCompanyMembers(formData.clientCompanyId, true)
    }
    if (formData.developmentCompanyId) {
      fetchCompanyMembers(formData.developmentCompanyId, false)
    }
  }, [formData.clientCompanyId, formData.developmentCompanyId])

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2 }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="프로젝트명"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="설명"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      <FormControl
        fullWidth
        sx={{ mb: 2 }}>
        <InputLabel>고객사</InputLabel>
        <Select
          name="clientCompanyId"
          value={formData.clientCompanyId}
          onChange={handleSelectChange}
          required>
          {companies.map(company => (
            <MenuItem
              key={company.id}
              value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.clientCompanyId && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            고객사 담당자
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                multiple
                name="clientManagers"
                value={formData.clientManagers}
                onChange={handleMultiSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={clientMembers.find(member => member.id.toString() === value)?.name}
                      />
                    ))}
                  </Box>
                )}
                required>
                {clientMembers.map(member => (
                  <MenuItem
                    key={member.id}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            고객사 일반 참여자
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                multiple
                name="clientParticipants"
                value={formData.clientParticipants}
                onChange={handleMultiSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={clientMembers.find(member => member.id.toString() === value)?.name}
                      />
                    ))}
                  </Box>
                )}>
                {clientMembers.map(member => (
                  <MenuItem
                    key={member.id}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </>
      )}

      <FormControl
        fullWidth
        sx={{ mb: 2 }}>
        <InputLabel>개발사</InputLabel>
        <Select
          name="developmentCompanyId"
          value={formData.developmentCompanyId}
          onChange={handleSelectChange}
          required>
          {companies.map(company => (
            <MenuItem
              key={company.id}
              value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.developmentCompanyId && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            개발사 담당자
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                multiple
                name="developmentManagers"
                value={formData.developmentManagers}
                onChange={handleMultiSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={developmentMembers.find(member => member.id.toString() === value)?.name}
                      />
                    ))}
                  </Box>
                )}
                required>
                {developmentMembers.map(member => (
                  <MenuItem
                    key={member.id}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            개발사 일반 참여자
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                multiple
                name="developmentParticipants"
                value={formData.developmentParticipants}
                onChange={handleMultiSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={developmentMembers.find(member => member.id.toString() === value)?.name}
                      />
                    ))}
                  </Box>
                )}>
                {developmentMembers.map(member => (
                  <MenuItem
                    key={member.id}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </>
      )}

      <DatePicker
        label="시작일"
        value={formData.startDate || null}
        onChange={date => handleDateChange('startDate', date)}
        sx={{ mb: 2, width: '100%' }}
      />

      <DatePicker
        label="종료일"
        value={formData.endDate || null}
        onChange={date => handleDateChange('endDate', date)}
        sx={{ mb: 2, width: '100%' }}
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}>
          취소
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </Box>
    </Box>
  )
} 