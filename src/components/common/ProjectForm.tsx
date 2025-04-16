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
  Chip,
  OutlinedInput,
  ListItemText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'

interface Company {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
  companyId: string
  position: string
}

enum ProjectStatus {
  CONTRACT = 'CONTRACT',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  MAINTENANCE = 'MAINTENANCE',
  ON_HOLD = 'ON_HOLD'
}

const statusDisplayNames: Record<ProjectStatus, string> = {
  [ProjectStatus.CONTRACT]: '계약',
  [ProjectStatus.IN_PROGRESS]: '진행중',
  [ProjectStatus.DELIVERED]: '납품완료',
  [ProjectStatus.MAINTENANCE]: '하자보수',
  [ProjectStatus.ON_HOLD]: '일시중단'
}

interface ProjectFormData {
  name: string
  description: string
  startDate: Dayjs | null
  endDate: Dayjs | null
  clientCompanyId: string
  developerCompanyId: string
  selectedEmployees: string[]
  managers: string[]
  participants: string[]
  status: ProjectStatus
}

interface FormErrors {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  clientCompanyId?: string
  developerCompanyId?: string
  status?: string
}

interface ProjectFormProps {
  companies: Company[]
  employees: Employee[]
  onSubmit: (data: any) => void
  initialData?: any
  isEdit?: boolean
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  companies,
  employees,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    clientCompanyId: '',
    developerCompanyId: '',
    selectedEmployees: [],
    managers: [],
    participants: [],
    status: ProjectStatus.CONTRACT
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [, setClientCompanyEmployees] = useState<Employee[]>([])
  const [, setDeveloperCompanyEmployees] = useState<Employee[]>([])
  const [, setClientSelectedEmployees] = useState<string[]>([])
  const [, setDeveloperSelectedEmployees] = useState<string[]>([])
  const [clientManagers, setClientManagers] = useState<string[]>([])
  const [clientParticipants, setClientParticipants] = useState<string[]>([])
  const [developerManagers, setDeveloperManagers] = useState<string[]>([])
  const [developerParticipants, setDeveloperParticipants] = useState<string[]>(
    []
  )

  useEffect(() => {
    if (initialData) {
      console.log('Initial Data in ProjectForm:', initialData)

      // 회사 이름으로 ID 찾기
      const clientCompany = companies.find(
        company => company.name === initialData.clientCompanyName
      )
      const developerCompany = companies.find(
        company => company.name === initialData.devCompanyName
      )

      // 회사 ID를 문자열로 변환
      const clientCompanyId = String(
        clientCompany?.id || initialData.clientCompanyId || ''
      )
      const developerCompanyId = String(
        developerCompany?.id || initialData.developerCompanyId || ''
      )

      // 직원 이름으로 ID 찾기
      const findEmployeeIdsByNames = (names: string[], companyId: string) => {
        return names
          .map(name => {
            const employee = employees.find(
              emp => emp.name === name && emp.companyId === companyId
            )
            return employee?.id || ''
          })
          .filter(id => id !== '')
      }

      // 고객사 직원 ID 찾기
      const clientManagerIds = findEmployeeIdsByNames(
        initialData.clientManagers || [],
        clientCompanyId
      )
      const clientParticipantIds = findEmployeeIdsByNames(
        initialData.clientParticipants || [],
        clientCompanyId
      )

      // 개발사 직원 ID 찾기
      const devManagerIds = findEmployeeIdsByNames(
        initialData.developmentManagers || [],
        developerCompanyId
      )
      const devParticipantIds = findEmployeeIdsByNames(
        initialData.developmentParticipants || [],
        developerCompanyId
      )

      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? dayjs(initialData.startDate) : null,
        endDate: initialData.endDate ? dayjs(initialData.endDate) : null,
        clientCompanyId,
        developerCompanyId,
        selectedEmployees: [
          ...clientManagerIds,
          ...clientParticipantIds,
          ...devManagerIds,
          ...devParticipantIds
        ],
        managers: [...clientManagerIds, ...devManagerIds],
        participants: [...clientParticipantIds, ...devParticipantIds],
        status: initialData.status || ProjectStatus.CONTRACT
      })

      // 직원 상태 설정
      setClientManagers(clientManagerIds)
      setClientParticipants(clientParticipantIds)
      setDeveloperManagers(devManagerIds)
      setDeveloperParticipants(devParticipantIds)

      // 회사별 선택된 직원 설정
      setClientSelectedEmployees([...clientManagerIds, ...clientParticipantIds])
      setDeveloperSelectedEmployees([...devManagerIds, ...devParticipantIds])

      // 회사 직원 목록 설정
      if (clientCompanyId) {
        const filteredEmployees = getCompanyEmployees(clientCompanyId)
        setClientCompanyEmployees(filteredEmployees)
      }
      if (developerCompanyId) {
        const filteredEmployees = getCompanyEmployees(developerCompanyId)
        setDeveloperCompanyEmployees(filteredEmployees)
      }
    }
  }, [initialData, employees, companies])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target

    // 회사 선택이 변경될 때 해당 회사의 담당자 목록 초기화
    if (name === 'clientCompanyId') {
      setClientManagers([])
      setClientParticipants([])
    } else if (name === 'developerCompanyId') {
      setDeveloperManagers([])
      setDeveloperParticipants([])
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (name: string, value: Dayjs | null) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // 회사 ID 처리
      const clientCompanyId =
        formData.clientCompanyId ||
        companies.find(c => c.name === initialData?.clientCompanyName)?.id ||
        initialData?.clientCompanyId

      const devCompanyId =
        formData.developerCompanyId ||
        companies.find(c => c.name === initialData?.devCompanyName)?.id ||
        initialData?.devCompanyId

      // 직원 ID 처리
      const getEmployeeIds = (
        names: string[] = [],
        companyId: string,
        currentIds: string[] = []
      ) => {
        if (currentIds.length > 0) {
          return currentIds.map(id => Number(id))
        }
        return names
          .map(name => {
            const employee = employees.find(
              emp => emp.name === name && emp.companyId === companyId
            )
            return employee ? Number(employee.id) : null
          })
          .filter((id): id is number => id !== null)
      }

      // 서버에 맞는 형식으로 데이터 변환
      const submitData = {
        title: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate?.format('YYYY-MM-DD[T]HH:mm:ss'),
        endDate: formData.endDate?.format('YYYY-MM-DD[T]HH:mm:ss'),
        clientCompanyId: Number(clientCompanyId),
        devCompanyId: Number(devCompanyId),
        devManagers: getEmployeeIds(
          initialData?.developmentManagers,
          String(devCompanyId),
          developerManagers
        ),
        devMembers: getEmployeeIds(
          initialData?.developmentParticipants,
          String(devCompanyId),
          developerParticipants
        ),
        clientManagers: getEmployeeIds(
          initialData?.clientManagers,
          String(clientCompanyId),
          clientManagers
        ),
        clientMembers: getEmployeeIds(
          initialData?.clientParticipants,
          String(clientCompanyId),
          clientParticipants
        )
      }

      console.log('Submit Data:', submitData)
      onSubmit(submitData)
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    if (!formData.name) newErrors.name = '프로젝트 이름을 입력해주세요'
    if (formData.name && formData.name.length > 255)
      newErrors.name = '프로젝트 이름은 255자를 넘을 수 없습니다'
    if (formData.description && formData.description.length > 5000)
      newErrors.description = '프로젝트 설명은 5000자를 넘을 수 없습니다'
    if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요'
    if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요'
    if (!formData.clientCompanyId)
      newErrors.clientCompanyId = '고객사를 선택해주세요'
    if (!formData.developerCompanyId)
      newErrors.developerCompanyId = '개발사를 선택해주세요'
    if (!formData.status) newErrors.status = '프로젝트 상태를 선택해주세요'

    // 담당자 필수 체크
    if (clientManagers.length === 0) {
      newErrors.clientCompanyId =
        '고객사 담당자는 최소 1명 이상 지정해야 합니다'
    }
    if (developerManagers.length === 0) {
      newErrors.developerCompanyId =
        '개발사 담당자는 최소 1명 이상 지정해야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 선택된 회사의 직원 목록 필터링
  const getCompanyEmployees = (companyId: string) => {
    console.log('Getting employees for company:', companyId)
    const filtered = employees.filter(
      employee => employee.companyId === companyId
    )
    console.log('Filtered employees:', filtered)
    return filtered
  }

  // 회사 선택 시 해당 회사의 직원 목록 업데이트
  useEffect(() => {
    console.log('Client Company ID:', formData.clientCompanyId)
    console.log('All Employees:', employees)

    if (formData.clientCompanyId) {
      const filteredEmployees = getCompanyEmployees(formData.clientCompanyId)
      console.log('Filtered Client Employees:', filteredEmployees)
      setClientCompanyEmployees(filteredEmployees)

      // 이미 선택된 직원들 중에서 현재 회사의 직원만 필터링
      const selectedClientEmployees = formData.selectedEmployees.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.clientCompanyId
      })
      setClientSelectedEmployees(selectedClientEmployees)
    }
  }, [formData.clientCompanyId, employees, formData.selectedEmployees])

  useEffect(() => {
    console.log('Developer Company ID:', formData.developerCompanyId)
    if (formData.developerCompanyId) {
      const filteredEmployees = getCompanyEmployees(formData.developerCompanyId)
      console.log('Filtered Developer Employees:', filteredEmployees)
      setDeveloperCompanyEmployees(filteredEmployees)

      // 이미 선택된 직원들 중에서 현재 회사의 직원만 필터링
      const selectedDeveloperEmployees = formData.selectedEmployees.filter(
        id => {
          const employee = employees.find(emp => emp.id === id)
          return employee && employee.companyId === formData.developerCompanyId
        }
      )
      setDeveloperSelectedEmployees(selectedDeveloperEmployees)
    }
  }, [formData.developerCompanyId, employees, formData.selectedEmployees])

  // 고객사 담당자 선택 처리
  const handleClientManagerSelect = (event: SelectChangeEvent<string[]>) => {
    const selectedIds = event.target.value as string[]
    setClientManagers(selectedIds)

    // 전체 담당자 목록 업데이트
    const otherManagers = formData.managers.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.clientCompanyId
    })

    // 선택된 직원 목록 업데이트
    const otherSelectedEmployees = formData.selectedEmployees.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.clientCompanyId
    })

    // 기존 참여자 목록에서 선택된 담당자 제거
    const updatedParticipants = formData.participants.filter(
      id => !selectedIds.includes(id)
    )

    setFormData(prev => ({
      ...prev,
      managers: [...otherManagers, ...selectedIds],
      participants: updatedParticipants,
      selectedEmployees: [...otherSelectedEmployees, ...selectedIds]
    }))
  }

  // 고객사 참여자 선택 처리
  const handleClientParticipantSelect = (
    event: SelectChangeEvent<string[]>
  ) => {
    const selectedIds = event.target.value as string[]
    setClientParticipants(selectedIds)

    // 전체 참여자 목록 업데이트
    const otherParticipants = formData.participants.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.clientCompanyId
    })

    // 선택된 직원 목록 업데이트
    const otherSelectedEmployees = formData.selectedEmployees.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.clientCompanyId
    })

    // 기존 담당자 목록에서 선택된 참여자 제거
    const updatedManagers = formData.managers.filter(
      id => !selectedIds.includes(id)
    )

    setFormData(prev => ({
      ...prev,
      participants: [...otherParticipants, ...selectedIds],
      managers: updatedManagers,
      selectedEmployees: [...otherSelectedEmployees, ...selectedIds]
    }))
  }

  // 개발사 담당자 선택 처리
  const handleDeveloperManagerSelect = (event: SelectChangeEvent<string[]>) => {
    const selectedIds = event.target.value as string[]
    setDeveloperManagers(selectedIds)

    // 전체 담당자 목록 업데이트
    const otherManagers = formData.managers.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.developerCompanyId
    })

    // 선택된 직원 목록 업데이트
    const otherSelectedEmployees = formData.selectedEmployees.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.developerCompanyId
    })

    // 기존 참여자 목록에서 선택된 담당자 제거
    const updatedParticipants = formData.participants.filter(
      id => !selectedIds.includes(id)
    )

    setFormData(prev => ({
      ...prev,
      managers: [...otherManagers, ...selectedIds],
      participants: updatedParticipants,
      selectedEmployees: [...otherSelectedEmployees, ...selectedIds]
    }))
  }

  // 개발사 참여자 선택 처리
  const handleDeveloperParticipantSelect = (
    event: SelectChangeEvent<string[]>
  ) => {
    const selectedIds = event.target.value as string[]
    setDeveloperParticipants(selectedIds)

    // 전체 참여자 목록 업데이트
    const otherParticipants = formData.participants.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.developerCompanyId
    })

    // 선택된 직원 목록 업데이트
    const otherSelectedEmployees = formData.selectedEmployees.filter(id => {
      const employee = employees.find(emp => emp.id === id)
      return employee && employee.companyId !== formData.developerCompanyId
    })

    // 기존 담당자 목록에서 선택된 참여자 제거
    const updatedManagers = formData.managers.filter(
      id => !selectedIds.includes(id)
    )

    setFormData(prev => ({
      ...prev,
      participants: [...otherParticipants, ...selectedIds],
      managers: updatedManagers,
      selectedEmployees: [...otherSelectedEmployees, ...selectedIds]
    }))
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        backgroundColor: 'background.paper',
        position: 'relative',
        zIndex: 0
      }}>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom>
        {isEdit ? '프로젝트 수정' : '새 프로젝트 생성'}
      </Typography>

      <TextField
        label="프로젝트 이름"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        required
      />

      <TextField
        label="프로젝트 설명"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={!!errors.description}
        helperText={errors.description}
        multiline
        rows={4}
        fullWidth
        required
      />

      <FormControl fullWidth>
        <InputLabel id="status-label">프로젝트 상태</InputLabel>
        <Select
          labelId="status-label"
          name="status"
          value={formData.status}
          onChange={handleSelectChange}
          label="프로젝트 상태"
          required>
          {Object.entries(ProjectStatus).map(([_, value]) => (
            <MenuItem
              key={value}
              value={value}>
              {statusDisplayNames[value as ProjectStatus]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="시작일"
          value={formData.startDate}
          onChange={date => handleDateChange('startDate', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.startDate,
              helperText: errors.startDate
            }
          }}
        />
        <DatePicker
          label="종료일"
          value={formData.endDate}
          onChange={date => handleDateChange('endDate', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.endDate,
              helperText: errors.endDate
            }
          }}
        />
      </Box>

      <FormControl
        fullWidth
        error={!!errors.clientCompanyId}>
        <InputLabel id="client-company-label">고객사</InputLabel>
        <Select
          labelId="client-company-label"
          name="clientCompanyId"
          value={formData.clientCompanyId}
          onChange={handleSelectChange}
          label="고객사">
          <MenuItem value="">
            <em>선택하세요</em>
          </MenuItem>
          {companies.map(company => (
            <MenuItem
              key={company.id}
              value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
        {errors.clientCompanyId && (
          <FormHelperText>{errors.clientCompanyId}</FormHelperText>
        )}
      </FormControl>

      {/* 고객사 직원 선택 */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          position: 'relative',
          zIndex: 0,
          boxShadow: 2
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
          <Typography variant="h6">고객사 담당자 선택</Typography>
          <Chip
            label={`${clientManagers.length + clientParticipants.length}명 선택됨`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="client-managers-label">담당자 선택</InputLabel>
            <Select
              labelId="client-managers-label"
              multiple
              value={clientManagers}
              onChange={handleClientManagerSelect}
              input={<OutlinedInput label="담당자 선택" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const employee = employees.find(emp => emp.id === value)
                    return (
                      <Chip
                        key={value}
                        label={employee?.name || ''}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: 'primary.light',
                          '& .MuiChip-label': {
                            color: 'primary.contrastText',
                            px: 1
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250
                  }
                }
              }}>
              {employees
                .filter(
                  employee => employee.companyId === formData.clientCompanyId
                )
                .map(employee => (
                  <MenuItem
                    key={employee.id}
                    value={employee.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 2
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <Typography variant="body2">
                          {employee.name.charAt(0)}
                        </Typography>
                      </Box>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.position}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="client-participants-label">
              일반 참여자 선택
            </InputLabel>
            <Select
              labelId="client-participants-label"
              multiple
              value={clientParticipants}
              onChange={handleClientParticipantSelect}
              input={<OutlinedInput label="일반 참여자 선택" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const employee = employees.find(emp => emp.id === value)
                    return (
                      <Chip
                        key={value}
                        label={employee?.name || ''}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: 'secondary.light',
                          '& .MuiChip-label': {
                            color: 'secondary.contrastText',
                            px: 1
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250
                  }
                }
              }}>
              {employees
                .filter(
                  employee => employee.companyId === formData.clientCompanyId
                )
                .map(employee => (
                  <MenuItem
                    key={employee.id}
                    value={employee.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 2
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <Typography variant="body2">
                          {employee.name.charAt(0)}
                        </Typography>
                      </Box>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.position}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <FormControl
        fullWidth
        error={!!errors.developerCompanyId}>
        <InputLabel id="developer-company-label">개발사</InputLabel>
        <Select
          labelId="developer-company-label"
          name="developerCompanyId"
          value={formData.developerCompanyId}
          onChange={handleSelectChange}
          label="개발사">
          <MenuItem value="">
            <em>선택하세요</em>
          </MenuItem>
          {companies.map(company => (
            <MenuItem
              key={company.id}
              value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
        {errors.developerCompanyId && (
          <FormHelperText>{errors.developerCompanyId}</FormHelperText>
        )}
      </FormControl>

      {/* 개발사 직원 선택 */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          position: 'relative',
          zIndex: 0,
          boxShadow: 2
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
          <Typography variant="h6">개발사 담당자 선택</Typography>
          <Chip
            label={`${developerManagers.length + developerParticipants.length}명 선택됨`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="developer-managers-label">담당자 선택</InputLabel>
            <Select
              labelId="developer-managers-label"
              multiple
              value={developerManagers}
              onChange={handleDeveloperManagerSelect}
              input={<OutlinedInput label="담당자 선택" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const employee = employees.find(emp => emp.id === value)
                    return (
                      <Chip
                        key={value}
                        label={employee?.name || ''}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: 'primary.light',
                          '& .MuiChip-label': {
                            color: 'primary.contrastText',
                            px: 1
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250
                  }
                }
              }}>
              {employees
                .filter(
                  employee => employee.companyId === formData.developerCompanyId
                )
                .map(employee => (
                  <MenuItem
                    key={employee.id}
                    value={employee.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 2
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <Typography variant="body2">
                          {employee.name.charAt(0)}
                        </Typography>
                      </Box>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.position}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="developer-participants-label">
              일반 참여자 선택
            </InputLabel>
            <Select
              labelId="developer-participants-label"
              multiple
              value={developerParticipants}
              onChange={handleDeveloperParticipantSelect}
              input={<OutlinedInput label="일반 참여자 선택" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const employee = employees.find(emp => emp.id === value)
                    return (
                      <Chip
                        key={value}
                        label={employee?.name || ''}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: 'secondary.light',
                          '& .MuiChip-label': {
                            color: 'secondary.contrastText',
                            px: 1
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250
                  }
                }
              }}>
              {employees
                .filter(
                  employee => employee.companyId === formData.developerCompanyId
                )
                .map(employee => (
                  <MenuItem
                    key={employee.id}
                    value={employee.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 2
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <Typography variant="body2">
                          {employee.name.charAt(0)}
                        </Typography>
                      </Box>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.position}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => window.history.back()}>
          취소
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary">
          {isEdit ? '수정' : '생성'}
        </Button>
      </Box>
    </Box>
  )
}

export default ProjectForm
