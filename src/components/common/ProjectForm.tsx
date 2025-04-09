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
}

interface FormErrors {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  clientCompanyId?: string
  developerCompanyId?: string
}

interface ProjectFormProps {
  companies: Company[]
  employees: Employee[]
  onSubmit: (data: ProjectFormData) => void
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
    participants: []
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [clientCompanyEmployees, setClientCompanyEmployees] = useState<
    Employee[]
  >([])
  const [developerCompanyEmployees, setDeveloperCompanyEmployees] = useState<
    Employee[]
  >([])
  const [clientSelectedEmployees, setClientSelectedEmployees] = useState<
    string[]
  >([])
  const [developerSelectedEmployees, setDeveloperSelectedEmployees] = useState<
    string[]
  >([])
  const [clientManagers, setClientManagers] = useState<string[]>([])
  const [clientParticipants, setClientParticipants] = useState<string[]>([])
  const [developerManagers, setDeveloperManagers] = useState<string[]>([])
  const [developerParticipants, setDeveloperParticipants] = useState<string[]>(
    []
  )

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? dayjs(initialData.startDate) : null,
        endDate: initialData.endDate ? dayjs(initialData.endDate) : null,
        clientCompanyId: initialData.clientCompanyId || '',
        developerCompanyId: initialData.developerCompanyId || '',
        selectedEmployees: initialData.selectedEmployees || [],
        managers: initialData.managers || [],
        participants: initialData.participants || []
      })
    }
  }, [initialData])

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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDateChange = (name: string, value: Dayjs | null) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // const handleEmployeeSelect = (employeeId: string) => {
  //   if (!formData.selectedEmployees.includes(employeeId)) {
  //     setFormData(prev => ({
  //       ...prev,
  //       selectedEmployees: [...prev.selectedEmployees, employeeId]
  //     }))
  //   }
  // }

  // const handleEmployeeRemove = (employeeId: string, companyId: string) => {
  //   if (companyId === formData.clientCompanyId) {
  //     setClientManagers(prev => prev.filter(id => id !== employeeId))
  //     setClientParticipants(prev => prev.filter(id => id !== employeeId))
  //   } else if (companyId === formData.developerCompanyId) {
  //     setDeveloperManagers(prev => prev.filter(id => id !== employeeId))
  //     setDeveloperParticipants(prev => prev.filter(id => id !== employeeId))
  //   }

  //   setFormData(prev => ({
  //     ...prev,
  //     selectedEmployees: prev.selectedEmployees.filter(id => id !== employeeId),
  //     managers: prev.managers.filter(id => id !== employeeId),
  //     participants: prev.participants.filter(id => id !== employeeId)
  //   }))
  // }

  // const handleAssignRole = (
  //   employeeId: string,
  //   role: 'manager' | 'participant'
  // ) => {
  //   if (role === 'manager') {
  //     if (!formData.managers.includes(employeeId)) {
  //       setFormData(prev => ({
  //         ...prev,
  //         managers: [...prev.managers, employeeId],
  //         participants: prev.participants.filter(id => id !== employeeId)
  //       }))
  //     }
  //   } else {
  //     if (!formData.participants.includes(employeeId)) {
  //       setFormData(prev => ({
  //         ...prev,
  //         participants: [...prev.participants, employeeId],
  //         managers: prev.managers.filter(id => id !== employeeId)
  //       }))
  //     }
  //   }
  // }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    if (!formData.name) newErrors.name = '프로젝트 이름을 입력해주세요'
    if (!formData.description)
      newErrors.description = '프로젝트 설명을 입력해주세요'
    if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요'
    if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요'
    if (!formData.clientCompanyId)
      newErrors.clientCompanyId = '고객사를 선택해주세요'
    if (!formData.developerCompanyId)
      newErrors.developerCompanyId = '개발사를 선택해주세요'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // 선택된 회사의 직원 목록 필터링
  const getCompanyEmployees = (companyId: string) => {
    return employees.filter(employee => employee.companyId === companyId)
  }

  // 직원의 역할 확인
  // const getEmployeeRole = (employeeId: string) => {
  //   if (formData.managers.includes(employeeId)) return 'manager'
  //   if (formData.participants.includes(employeeId)) return 'participant'
  //   return null
  // }

  // 회사 선택 시 해당 회사의 직원 목록 업데이트
  useEffect(() => {
    if (formData.clientCompanyId) {
      const filteredEmployees = getCompanyEmployees(formData.clientCompanyId)
      setClientCompanyEmployees(filteredEmployees)

      // 이미 선택된 직원들 중에서 현재 회사의 직원만 필터링
      const selectedClientEmployees = formData.selectedEmployees.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.clientCompanyId
      })
      setClientSelectedEmployees(selectedClientEmployees)

      // 담당자와 참여자 분리
      const clientManagers = formData.managers.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.clientCompanyId
      })
      setClientManagers(clientManagers)

      const clientParticipants = formData.participants.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.clientCompanyId
      })
      setClientParticipants(clientParticipants)
    } else {
      setClientCompanyEmployees([])
      setClientSelectedEmployees([])
      setClientManagers([])
      setClientParticipants([])
    }
  }, [
    formData.clientCompanyId,
    employees,
    formData.selectedEmployees,
    formData.managers,
    formData.participants
  ])

  useEffect(() => {
    if (formData.developerCompanyId) {
      const filteredEmployees = getCompanyEmployees(formData.developerCompanyId)
      setDeveloperCompanyEmployees(filteredEmployees)

      // 이미 선택된 직원들 중에서 현재 회사의 직원만 필터링
      const selectedDeveloperEmployees = formData.selectedEmployees.filter(
        id => {
          const employee = employees.find(emp => emp.id === id)
          return employee && employee.companyId === formData.developerCompanyId
        }
      )
      setDeveloperSelectedEmployees(selectedDeveloperEmployees)

      // 담당자와 참여자 분리
      const developerManagers = formData.managers.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.developerCompanyId
      })
      setDeveloperManagers(developerManagers)

      const developerParticipants = formData.participants.filter(id => {
        const employee = employees.find(emp => emp.id === id)
        return employee && employee.companyId === formData.developerCompanyId
      })
      setDeveloperParticipants(developerParticipants)
    } else {
      setDeveloperCompanyEmployees([])
      setDeveloperSelectedEmployees([])
      setDeveloperManagers([])
      setDeveloperParticipants([])
    }
  }, [
    formData.developerCompanyId,
    employees,
    formData.selectedEmployees,
    formData.managers,
    formData.participants
  ])

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

  // 직원 역할 변경 처리
  // const handleRoleChange = (
  //   employeeId: string,
  //   role: 'manager' | 'participant'
  // ) => {
  //   if (role === 'manager') {
  //     if (!formData.managers.includes(employeeId)) {
  //       setFormData(prev => ({
  //         ...prev,
  //         managers: [...prev.managers, employeeId],
  //         participants: prev.participants.filter(id => id !== employeeId)
  //       }))
  //     }
  //   } else {
  //     if (!formData.participants.includes(employeeId)) {
  //       setFormData(prev => ({
  //         ...prev,
  //         participants: [...prev.participants, employeeId],
  //         managers: prev.managers.filter(id => id !== employeeId)
  //       }))
  //     }
  //   }
  // }

  // 직원 카드 렌더링 함수
  // const renderEmployeeCard = (employee: Employee) => {
  //   const isSelected = formData.selectedEmployees.includes(employee.id)
  //   const role = getEmployeeRole(employee.id)

  //   return (
  //     <Card
  //       key={employee.id}
  //       sx={{
  //         width: '100%',
  //         height: '50px',
  //         position: 'relative',
  //         border: isSelected ? '1px solid' : 'none',
  //         borderColor:
  //           role === 'manager'
  //             ? 'primary.main'
  //             : role === 'participant'
  //               ? 'secondary.main'
  //               : 'divider',
  //         boxShadow: isSelected ? 2 : 1,
  //         transition: 'all 0.2s',
  //         display: 'flex',
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         justifyContent: 'space-between',
  //         p: 1
  //       }}>
  //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //         {role === 'manager' ? (
  //           <User
  //             size={16}
  //             color="var(--mui-palette-primary-main)"
  //           />
  //         ) : role === 'participant' ? (
  //           <Users
  //             size={16}
  //             color="var(--mui-palette-secondary-main)"
  //           />
  //         ) : (
  //           <User
  //             size={16}
  //             color="var(--mui-palette-text-secondary)"
  //           />
  //         )}
  //         <Box>
  //           <Typography
  //             variant="body2"
  //             noWrap
  //             sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}>
  //             {employee.name}
  //           </Typography>
  //           <Typography
  //             variant="caption"
  //             color="text.secondary"
  //             sx={{ fontSize: '0.7rem' }}>
  //             {employee.position}
  //           </Typography>
  //         </Box>
  //       </Box>

  //       {!isSelected ? (
  //         <Box sx={{ display: 'flex', gap: 0.5 }}>
  //           <Tooltip title="담당자로 지정">
  //             <Chip
  //               label="담당자"
  //               size="small"
  //               onClick={() => {
  //                 handleEmployeeSelect(employee.id, employee.companyId)
  //                 handleAssignRole(employee.id, 'manager')
  //               }}
  //               color="primary"
  //               variant="outlined"
  //               sx={{
  //                 height: 20,
  //                 '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' }
  //               }}
  //             />
  //           </Tooltip>
  //           <Tooltip title="참여자로 지정">
  //             <Chip
  //               label="참여자"
  //               size="small"
  //               onClick={() => {
  //                 handleEmployeeSelect(employee.id, employee.companyId)
  //                 handleAssignRole(employee.id, 'participant')
  //               }}
  //               color="secondary"
  //               variant="outlined"
  //               sx={{
  //                 height: 20,
  //                 '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' }
  //               }}
  //             />
  //           </Tooltip>
  //         </Box>
  //       ) : (
  //         <Box sx={{ display: 'flex', gap: 0.5 }}>
  //           <Chip
  //             label={role === 'manager' ? '담당자' : '참여자'}
  //             size="small"
  //             color={role === 'manager' ? 'primary' : 'secondary'}
  //             variant="filled"
  //             sx={{
  //               height: 20,
  //               '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' }
  //             }}
  //           />
  //           <Tooltip title="선택 취소">
  //             <IconButton
  //               size="small"
  //               onClick={() =>
  //                 handleEmployeeRemove(employee.id, employee.companyId)
  //               }
  //               sx={{ p: 0.5 }}>
  //               <X size={16} />
  //             </IconButton>
  //           </Tooltip>
  //         </Box>
  //       )}
  //     </Card>
  //   )
  // }

  // 선택된 직원 목록 렌더링 함수
  // const renderSelectedEmployees = (companyId: string) => {
  //   const selectedEmployees = formData.selectedEmployees.filter(id => {
  //     const employee = employees.find(emp => emp.id === id)
  //     return employee && employee.companyId === companyId
  //   })

  //   if (selectedEmployees.length === 0) return null

  //   return (
  //     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
  //       {selectedEmployees.map(id => {
  //         const employee = employees.find(emp => emp.id === id)
  //         if (!employee) return null

  //         const role = getEmployeeRole(id)
  //         return (
  //           <Chip
  //             key={id}
  //             label={`${employee.name} (${role === 'manager' ? '담당자' : '참여자'})`}
  //             color={role === 'manager' ? 'primary' : 'secondary'}
  //             variant="outlined"
  //             onDelete={() => handleEmployeeRemove(id, companyId)}
  //             sx={{ height: 28 }}
  //           />
  //         )
  //       })}
  //     </Box>
  //   )
  // }

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
      {formData.clientCompanyId && (
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
              label={`${clientSelectedEmployees.length}명 선택됨`}
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
                {clientCompanyEmployees.map(employee => (
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
                {clientCompanyEmployees.map(employee => (
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
      )}

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
      {formData.developerCompanyId && (
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
              label={`${developerSelectedEmployees.length}명 선택됨`}
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
                {developerCompanyEmployees.map(employee => (
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
                {developerCompanyEmployees.map(employee => (
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
      )}

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
