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
  Chip,
  CircularProgress,
  OutlinedInput,
  FormHelperText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import type { CompanyListItem, CompanyMember } from '../../types/api' // Assuming ApiResponse is defined
import { getCompanyMembers } from '../../api/company'
import { Dayjs } from 'dayjs'

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

// Define expected response type for getCompanyMembers
//interface CompanyMembersResponse extends ApiResponse<CompanyMember[] | null> {}

interface FormErrors {
  submit?: string
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  clientCompanyId?: string
  developmentCompanyId?: string
  clientManagers?: string
  developmentManagers?: string
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
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    clientCompanyId: '',
    developmentCompanyId: '',
    clientManagers: [] as string[],
    clientParticipants: [] as string[],
    developmentManagers: [] as string[],
    developmentParticipants: [] as string[]
  })

  const [clientMembers, setClientMembers] = useState<CompanyMember[]>([])
  const [developmentMembers, setDevelopmentMembers] = useState<CompanyMember[]>(
    []
  )
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null) // State for fetch errors
  const [errors, setErrors] = useState<FormErrors>({})
  const [, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    // Reset members when company changes
    if (name === 'clientCompanyId') {
      setClientMembers([])
      setFormData(prev => ({
        ...prev,
        clientManagers: [],
        clientParticipants: []
      }))
    }
    if (name === 'developmentCompanyId') {
      setDevelopmentMembers([])
      setFormData(prev => ({
        ...prev,
        developmentManagers: [],
        developmentParticipants: []
      }))
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target
    // Ensure value is always an array
    const selectedValues = typeof value === 'string' ? value.split(',') : value
    setFormData(prev => ({ ...prev, [name]: selectedValues }))
  }

  const handleDateChange = (name: string, date: Dayjs | null) => {
    setFormData(prev => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // 필수 필드 검증
      const requiredFields = [
        'name',
        'description',
        'startDate',
        'endDate',
        'clientCompanyId',
        'developmentCompanyId',
        'clientManagers',
        'developmentManagers'
      ]

      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData]
        return (
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')
        )
      })

      if (missingFields.length > 0) {
        const fieldErrors: Record<string, string> = {}
        missingFields.forEach(field => {
          fieldErrors[field] = `${field} 필드는 필수입니다.`
        })
        setErrors(fieldErrors)
        return
      }

      // 날짜 유효성 검증
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate.isAfter(formData.endDate)
      ) {
        setErrors(prev => ({
          ...prev,
          endDate: '종료일은 시작일보다 이후여야 합니다.'
        }))
        return
      }

      // 회사 ID 유효성 검증
      if (formData.clientCompanyId === formData.developmentCompanyId) {
        setErrors(prev => ({
          ...prev,
          developmentCompanyId: '고객사와 개발사는 서로 다른 회사여야 합니다.'
        }))
        return
      }

      // 담당자 유효성 검증
      if (formData.developmentManagers.length === 0) {
        setErrors(prev => ({
          ...prev,
          developmentManagers: '개발사 담당자는 최소 1명 이상이어야 합니다.'
        }))
        return
      }

      if (formData.clientManagers.length === 0) {
        setErrors(prev => ({
          ...prev,
          clientManagers: '고객사 담당자는 최소 1명 이상이어야 합니다.'
        }))
        return
      }

      // 날짜를 ISO 문자열로 변환 (YYYY-MM-DD 형식)
      const formattedData = {
        ...formData,
        startDate: formData.startDate?.format('YYYY-MM-DD') || '',
        endDate: formData.endDate?.format('YYYY-MM-DD') || ''
      }

      await onSave(formattedData)
    } catch (error: any) {
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchCompanyMembers = async (
      companyId: string,
      isClient: boolean
    ) => {
      const numericId = parseInt(companyId)
      if (isNaN(numericId)) {
        setFetchError('유효하지 않은 회사 ID입니다.')
        return
      }

      try {
        setLoadingMembers(true)
        setFetchError(null) // Clear previous errors
        // Explicitly type the expected response
        const response: any = await getCompanyMembers(numericId)
        if (response.status === 'success') {
          if (isClient) {
            // Use nullish coalescing to ensure an array is always set
            setClientMembers(response.data ?? [])
          } else {
            // Use nullish coalescing to ensure an array is always set
            setDevelopmentMembers(response.data ?? [])
          }
        } else {
          // Handle API error status
          const errorMsg =
            response.message || `회사 멤버 조회 실패 (ID: ${companyId})`
          console.error(errorMsg)
          setFetchError(errorMsg)
          if (isClient) setClientMembers([])
          else setDevelopmentMembers([])
        }
      } catch (err) {
        console.error('회사 멤버 조회 중 오류:', err)
        const errorMsg =
          err instanceof Error ? err.message : '알 수 없는 오류 발생'
        setFetchError(`회사 멤버 조회 중 오류: ${errorMsg}`)
        if (isClient) setClientMembers([])
        else setDevelopmentMembers([])
      } finally {
        setLoadingMembers(false)
      }
    }

    if (formData.clientCompanyId) {
      fetchCompanyMembers(formData.clientCompanyId, true)
    } else {
      setClientMembers([]) // Clear members if no company selected
    }
    if (formData.developmentCompanyId) {
      fetchCompanyMembers(formData.developmentCompanyId, false)
    } else {
      setDevelopmentMembers([]) // Clear members if no company selected
    }
  }, [formData.clientCompanyId, formData.developmentCompanyId])

  // Helper function to get member name
  const getMemberName = (id: string, members: CompanyMember[]): string => {
    return members.find(member => member.id.toString() === id)?.name || id
  }

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
      {fetchError && ( // Display fetch errors
        <Alert
          severity="warning"
          sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}
      {errors.submit && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <TextField
        fullWidth
        label="프로젝트명"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        error={!!errors.name}
        helperText={errors.name}
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
        required
        error={!!errors.description}
        helperText={errors.description}
        sx={{ mb: 2 }}
      />

      {/* Client Company Section */}
      <FormControl
        fullWidth
        sx={{ mb: 2 }}
        error={!!errors.clientCompanyId}>
        <InputLabel id="client-company-label">고객사</InputLabel>
        <Select
          labelId="client-company-label"
          label="고객사"
          name="clientCompanyId"
          value={formData.clientCompanyId}
          onChange={handleSelectChange}
          required>
          <MenuItem
            value=""
            disabled>
            <em>선택하세요</em>
          </MenuItem>
          {companies.map(company => (
            <MenuItem
              key={`client-${company.id}`}
              value={company.id.toString()}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
        {errors.clientCompanyId && (
          <FormHelperText>{errors.clientCompanyId}</FormHelperText>
        )}
      </FormControl>

      {formData.clientCompanyId && (
        <>
          {/* Client Managers */}
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            <InputLabel id="client-managers-label">고객사 담당자</InputLabel>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                labelId="client-managers-label"
                label="고객사 담당자"
                multiple
                name="clientManagers"
                value={formData.clientManagers}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="고객사 담당자" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={getMemberName(value, clientMembers)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                required>
                {clientMembers.length === 0 && (
                  <MenuItem disabled>
                    <em>멤버 없음</em>
                  </MenuItem>
                )}
                {clientMembers.map(member => (
                  <MenuItem
                    key={`client-m-${member.id}`}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          {/* Client Participants */}
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            <InputLabel id="client-participants-label">
              고객사 일반 참여자
            </InputLabel>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                labelId="client-participants-label"
                label="고객사 일반 참여자"
                multiple
                name="clientParticipants"
                value={formData.clientParticipants}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="고객사 일반 참여자" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={getMemberName(value, clientMembers)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}>
                {clientMembers.length === 0 && (
                  <MenuItem disabled>
                    <em>멤버 없음</em>
                  </MenuItem>
                )}
                {clientMembers.map(member => (
                  <MenuItem
                    key={`client-p-${member.id}`}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </>
      )}

      {/* Development Company Section */}
      <FormControl
        fullWidth
        sx={{ mb: 2 }}
        error={!!errors.developmentCompanyId}>
        <InputLabel id="dev-company-label">개발사</InputLabel>
        <Select
          labelId="dev-company-label"
          label="개발사"
          name="developmentCompanyId"
          value={formData.developmentCompanyId}
          onChange={handleSelectChange}
          required>
          <MenuItem
            value=""
            disabled>
            <em>선택하세요</em>
          </MenuItem>
          {companies.map(company => (
            <MenuItem
              key={`dev-${company.id}`}
              value={company.id.toString()}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
        {errors.developmentCompanyId && (
          <FormHelperText>{errors.developmentCompanyId}</FormHelperText>
        )}
      </FormControl>

      {formData.developmentCompanyId && (
        <>
          {/* Development Managers */}
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            <InputLabel id="dev-managers-label">개발사 담당자</InputLabel>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                labelId="dev-managers-label"
                label="개발사 담당자"
                multiple
                name="developmentManagers"
                value={formData.developmentManagers}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="개발사 담당자" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={getMemberName(value, developmentMembers)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                required>
                {developmentMembers.length === 0 && (
                  <MenuItem disabled>
                    <em>멤버 없음</em>
                  </MenuItem>
                )}
                {developmentMembers.map(member => (
                  <MenuItem
                    key={`dev-m-${member.id}`}
                    value={member.id.toString()}>
                    {member.name} ({member.position || '직책 없음'})
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          {/* Development Participants */}
          <FormControl
            fullWidth
            sx={{ mb: 2 }}>
            <InputLabel id="dev-participants-label">
              개발사 일반 참여자
            </InputLabel>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                labelId="dev-participants-label"
                label="개발사 일반 참여자"
                multiple
                name="developmentParticipants"
                value={formData.developmentParticipants}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="개발사 일반 참여자" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={getMemberName(value, developmentMembers)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}>
                {developmentMembers.length === 0 && (
                  <MenuItem disabled>
                    <em>멤버 없음</em>
                  </MenuItem>
                )}
                {developmentMembers.map(member => (
                  <MenuItem
                    key={`dev-p-${member.id}`}
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
        value={formData.startDate}
        onChange={date => handleDateChange('startDate', date)}
        sx={{ mb: 2, mr: 1, width: 'calc(50% - 4px)' }}
        slotProps={{ textField: { required: true } }}
      />

      <DatePicker
        label="종료일"
        value={formData.endDate}
        onChange={date => handleDateChange('endDate', date)}
        sx={{ mb: 2, width: 'calc(50% - 4px)' }}
        minDate={formData.startDate || undefined}
        slotProps={{ textField: { required: true } }}
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}>
          {' '}
          취소{' '}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}>
          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            '저장'
          )}
        </Button>
      </Box>
    </Box>
  )
}
