import React, { useState, useEffect } from 'react'
import { FixedSizeList } from 'react-window'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { DatePicker } from '@mui/x-date-pickers'
import { Search, Close } from '@mui/icons-material'
import type { CompanyMember } from '../../types/api'
import { getCompanyMembers } from '../../api/company'
import { projectService } from '../../services/projectService'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { Company } from '../../types'

interface Stage {
  id: number
  name: string
  order: number
  status: '대기' | '진행중' | '완료' | '지연'
}

interface ClientCompany {
  id: number
  name: string
  members: CompanyMember[]
  responsibles: CompanyMember[]
}

interface CreateProjectRequest {
  title: string
  description: string
  startDate: string
  endDate: string
  clientCompanyIds: number[]
  devCompanyId: number
  devManagers: number[]
  devMembers: number[]
  clientManagers: number[]
  clientMembers: number[]
}

export interface ProjectFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  devCompanyId: number
  devMembers: CompanyMember[]
  clientCompanies: ClientCompany[]
  stages: Stage[]
}

interface CreateProjectStepsProps {
  companies: Company[]
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
}

const steps = ['프로젝트 정보', '고객사 선택']

const defaultStages: Stage[] = [
  { id: 0, name: '계약', order: 1, status: '대기' },
  { id: 1, name: '설계', order: 2, status: '대기' },
  { id: 2, name: '개발', order: 3, status: '대기' },
  { id: 3, name: '테스트', order: 4, status: '대기' },
  { id: 4, name: '배포', order: 5, status: '대기' }
]

const initialFormData: ProjectFormData = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  devCompanyId: 0,
  devMembers: [],
  clientCompanies: [],
  stages: defaultStages
}

const CreateProjectSteps: React.FC<CreateProjectStepsProps> = ({
  companies,
  onSubmit,
  onCancel
}) => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeStep, setActiveStep] = useState(0)
  const [, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData)
  const [clientCompanySearch, setClientCompanySearch] = useState('')
  const [clientMembers, setClientMembers] = useState<CompanyMember[]>([])
  const [selectedClientMembers, setSelectedClientMembers] = useState<number[]>(
    []
  )
  const [selectedResponsibleMembers, setSelectedResponsibleMembers] = useState<
    number[]
  >([])
  const [clientMemberSearch, setClientMemberSearch] = useState('')
  const [, setIsMemberSelectionComplete] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [modalStep, setModalStep] = useState(0)
  const [] = useState<CompanyMember[]>([])
  const [, setClientCompanyMembers] = useState<CompanyMember[]>([])

  const handleNext = () => {
    if (!isStepValid()) {
      showToast('모든 필수 항목을 입력해주세요.', 'error')
      return
    }
    if (activeStep === steps.length - 1) {
      handleSubmit(new Event('submit') as any)
    } else {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: string | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }))
    }
  }

  const handleClientMemberToggle = (
    memberId: number,
    isResponsible: boolean
  ) => {
    if (isResponsible) {
      const newResponsibleMembers = selectedResponsibleMembers.includes(
        memberId
      )
        ? selectedResponsibleMembers.filter(id => id !== memberId)
        : [...selectedResponsibleMembers, memberId]
      setSelectedResponsibleMembers(newResponsibleMembers)
      setFormData(prev => ({
        ...prev,
        clientCompanies: prev.clientCompanies.map(company =>
          company.id === selectedCompany?.id
            ? {
                ...company,
                responsibles: company.responsibles.filter(
                  member => member.id !== memberId
                )
              }
            : company
        )
      }))
      setSelectedClientMembers(prev => prev.filter(id => id !== memberId))
      setFormData(prev => ({
        ...prev,
        clientCompanies: prev.clientCompanies.map(company =>
          company.id === selectedCompany?.id
            ? {
                ...company,
                members: company.members.filter(
                  member => member.id !== memberId
                )
              }
            : company
        )
      }))
    } else {
      const newMembers = selectedClientMembers.includes(memberId)
        ? selectedClientMembers.filter(id => id !== memberId)
        : [...selectedClientMembers, memberId]
      setSelectedClientMembers(newMembers)
      setFormData(prev => ({
        ...prev,
        clientCompanies: prev.clientCompanies.map(company =>
          company.id === selectedCompany?.id
            ? {
                ...company,
                members: newMembers
                  .map(id => company.members.find(m => m.id === id)!)
                  .filter(Boolean)
              }
            : company
        )
      }))
      setSelectedResponsibleMembers(prev => prev.filter(id => id !== memberId))
      setFormData(prev => ({
        ...prev,
        clientCompanies: prev.clientCompanies.map(company =>
          company.id === selectedCompany?.id
            ? {
                ...company,
                responsibles: company.responsibles.filter(
                  member => member.id !== memberId
                )
              }
            : company
        )
      }))
    }
  }

  const handleClientCompanySelect = (companyId: string) => {
    const parsedId = parseInt(companyId)
    if (!isNaN(parsedId)) {
      const selectedCompany = companies.find(company => company.id === parsedId)
      if (selectedCompany) {
        if (formData.clientCompanies.some(c => c.id === parsedId)) {
          showToast('이미 선택된 고객사입니다.', 'error')
          return
        }

        setFormData(prev => ({
          ...prev,
          clientCompanies: [
            ...prev.clientCompanies,
            {
              id: parsedId,
              name: selectedCompany.name,
              members: [],
              responsibles: []
            }
          ]
        }))

        setSelectedCompany(selectedCompany)
        getCompanyMembers(parsedId)
          .then(response => {
            if (response.data) {
              const members = Array.isArray(response.data) ? response.data : []
              setClientCompanyMembers(members)
              setClientMembers(members)
              setModalStep(1)
            }
          })
          .catch(error => {
            console.error('Error fetching company members:', error)
            showToast('회사 멤버 조회에 실패했습니다.', 'error')
          })
      }
    }
  }

  const handleMemberSelectionComplete = () => {
    if (selectedResponsibleMembers.length === 0) {
      showToast('최소 1명의 담당자를 선택해주세요.', 'error')
      return
    }

    const selectedMembers = clientMembers.filter(member =>
      selectedClientMembers.includes(member.id)
    )
    const selectedResponsibles = clientMembers.filter(member =>
      selectedResponsibleMembers.includes(member.id)
    )

    setFormData(prev => ({
      ...prev,
      clientCompanies: prev.clientCompanies.map(company =>
        company.id === selectedCompany?.id
          ? {
              ...company,
              members: selectedMembers,
              responsibles: selectedResponsibles
            }
          : company
      )
    }))

    setIsMemberSelectionComplete(true)
    setIsModalOpen(false)
    setModalStep(0)
    showToast('멤버 선택이 완료되었습니다.', 'success')
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(clientCompanySearch.toLowerCase())
  )

  const filteredClientMembers = clientMembers.filter(member =>
    member.name.toLowerCase().includes(clientMemberSearch.toLowerCase())
  )

  const projectNameError = formData.title.length > 100
  const descriptionError = formData.description.length > 1000
  const dateError =
    formData.startDate &&
    formData.endDate &&
    new Date(formData.startDate) > new Date(formData.endDate)

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.title.trim() !== '' &&
          formData.description.trim() !== '' &&
          formData.startDate !== '' &&
          formData.endDate !== '' &&
          formData.stages.length > 0 &&
          formData.stages.every(stage => stage.name.trim() !== '') &&
          !projectNameError &&
          !descriptionError &&
          !dateError
        )
      case 1:
        return formData.clientCompanies.length > 0
      default:
        return false
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(formData.stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    setFormData(prev => ({
      ...prev,
      stages: updatedItems
    }))
  }

  const handleAddStage = () => {
    const newStage: Stage = {
      id: formData.stages.length, // Temporary ID until saved
      name: '새 스테이지',
      order: formData.stages.length + 1,
      status: '대기'
    }
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="프로젝트명"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={projectNameError}
              helperText={
                projectNameError
                  ? '프로젝트명은 100자 이내로 작성할 수 있습니다'
                  : `${formData.title.length}/100`
              }
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
              error={descriptionError}
              helperText={
                descriptionError
                  ? '설명은 1000자 이내로 작성할 수 있습니다'
                  : `${formData.description.length}/1000`
              }
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="시작일"
                value={formData.startDate}
                onChange={date => handleDateChange('startDate', date)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    }
                  }
                }}
              />
              <DatePicker
                label="종료일"
                value={formData.endDate}
                onChange={date => handleDateChange('endDate', date)}
                minDate={formData.startDate}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    }
                  }
                }}
              />
            </Box>
            {dateError && (
              <Typography color="error">
                시작일이 종료일보다 미래일 수 없습니다
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="subtitle1"
              gutterBottom>
              프로젝트 스테이지 설정
            </Typography>
            <Paper sx={{ p: 2 }}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="stages">
                  {provided => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                      {formData.stages.map((stage, index) => (
                        <Draggable
                          key={index}
                          draggableId={`stage-${index}`}
                          index={index}>
                          {provided => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                borderBottom:
                                  index < formData.stages.length - 1 ? 1 : 0,
                                borderColor: 'divider',
                                py: 1,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}>
                              <Typography sx={{ minWidth: 40 }}>
                                {stage.order}.
                              </Typography>
                              <TextField
                                fullWidth
                                value={stage.name}
                                onChange={e => {
                                  const newStages = [...formData.stages]
                                  newStages[index] = {
                                    ...stage,
                                    name: e.target.value
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    stages: newStages
                                  }))
                                }}
                                size="small"
                              />
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  const newStages = formData.stages
                                    .filter((_, i) => i !== index)
                                    .map((s, i) => ({ ...s, order: i + 1 }))
                                  setFormData(prev => ({
                                    ...prev,
                                    stages: newStages
                                  }))
                                }}
                                disabled={formData.stages.length <= 1}>
                                삭제
                              </Button>
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAddStage}
                sx={{ mt: 2 }}>
                스테이지 추가
              </Button>
            </Paper>
          </Box>
        )
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formData.clientCompanies.length === 0 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsModalOpen(true)
                  setModalStep(0)
                }}>
                고객사 선택
              </Button>
            ) : (
              <>
                {formData.clientCompanies.map((company, index) => (
                  <Card key={company.id}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                          <Typography variant="subtitle1">
                            {company.name}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                clientCompanies: prev.clientCompanies.filter(
                                  (_, i) => i !== index
                                )
                              }))
                            }}>
                            삭제
                          </Button>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {company.responsibles.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle2"
                              gutterBottom>
                              담당자:
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1
                              }}>
                              {company.responsibles.map(member => (
                                <Chip
                                  key={member.id}
                                  label={`${member.name} (${member.position || '직책 없음'})`}
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {company.members.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle2"
                              gutterBottom>
                              멤버:
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1
                              }}>
                              {company.members.map(member => (
                                <Chip
                                  key={member.id}
                                  label={`${member.name} (${member.position || '직책 없음'})`}
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setIsModalOpen(true)
                    setModalStep(0)
                  }}>
                  고객사 추가
                </Button>
              </>
            )}
          </Box>
        )
      default:
        return null
    }
  }

  const renderModalContent = () => {
    switch (modalStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="회사 검색"
                  value={clientCompanySearch}
                  onChange={e => setClientCompanySearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
                <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <FixedSizeList
                    height={400}
                    width="100%"
                    itemSize={72}
                    itemCount={filteredCompanies.length}
                    overscanCount={5}>
                    {({ index, style }) => {
                      const company = filteredCompanies[index]
                      return (
                        <ListItem
                          key={company.id}
                          button
                          style={style}
                          onClick={() =>
                            handleClientCompanySelect(company.id.toString())
                          }>
                          <ListItemText
                            primary={company.name}
                            secondary={`${company.phoneNumber} | ${company.address}`}
                          />
                        </ListItem>
                      )
                    }}
                  </FixedSizeList>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        )
      case 1:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    선택된 회사: {selectedCompany?.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedCompany(null)
                      setModalStep(0)
                    }}>
                    변경
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom>
                      회사 멤버 선택
                    </Typography>
                    {selectedResponsibleMembers.length === 0 && (
                      <Typography
                        color="error"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 400
                        }}>
                        담당자는 반드시 추가해야 합니다
                      </Typography>
                    )}
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="멤버 검색"
                  value={clientMemberSearch}
                  onChange={e => setClientMemberSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
                <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <FixedSizeList
                    height={400}
                    width="100%"
                    itemSize={72}
                    itemCount={filteredClientMembers.length}
                    overscanCount={5}>
                    {({ index, style }) => {
                      const member = filteredClientMembers[index]
                      return (
                        <ListItem
                          key={member.id}
                          button
                          style={style}>
                          <ListItemText
                            primary={member.name}
                            secondary={`${member.position || '직책 없음'} | ${member.phoneNumber || '전화번호 없음'}`}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant={
                                selectedResponsibleMembers.includes(member.id)
                                  ? 'contained'
                                  : 'outlined'
                              }
                              size="small"
                              color="secondary"
                              onClick={() =>
                                handleClientMemberToggle(member.id, true)
                              }
                              sx={{ minWidth: '60px' }}>
                              담당자
                            </Button>
                            <Button
                              variant={
                                selectedClientMembers.includes(member.id)
                                  ? 'contained'
                                  : 'outlined'
                              }
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleClientMemberToggle(member.id, false)
                              }
                              sx={{ minWidth: '60px' }}>
                              멤버
                            </Button>
                          </Box>
                        </ListItem>
                      )
                    }}
                  </FixedSizeList>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.title ||
      !formData.description ||
      !formData.startDate ||
      !formData.endDate ||
      formData.clientCompanies.length === 0
    ) {
      showToast('모든 필수 항목을 입력해주세요.', 'error')
      return
    }

    try {
      setIsLoading(true)
      const requestData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        stageNames: formData.stages.map(stage => stage.name),
        clientAssignments: formData.clientCompanies.map(company => ({
          companyId: company.id,
          managerIds: company.responsibles.map(member => member.id),
          memberIds: company.members.map(member => member.id)
        }))
      }

      console.log('Sending request data:', requestData) // 디버깅용 로그

      const response = await projectService.createProject(requestData)

      if (response) {
        showToast('프로젝트가 성공적으로 생성되었습니다.', 'success')
        navigate('/admin/projects')
      } else {
        showToast('프로젝트 생성에 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('프로젝트 생성 중 오류:', err)
      showToast('프로젝트 생성에 실패했습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Remove console.log statements
  }, [clientMembers, filteredClientMembers])

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Stepper
            activeStep={activeStep}
            sx={{ width: '50%' }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom>
            {steps[activeStep]}
          </Typography>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={activeStep === 0 ? onCancel : handleBack}
            disabled={activeStep === 0}>
            {activeStep === 0 ? '취소' : '이전'}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}>
            {activeStep === steps.length - 1 ? '완료' : '다음'}
          </Button>
        </Box>

        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="md"
          fullWidth>
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            {modalStep === 0 ? '고객사 선택' : '멤버 선택'}
            <IconButton
              onClick={() => setIsModalOpen(false)}
              sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>{renderModalContent()}</DialogContent>
          {modalStep === 1 && (
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMemberSelectionComplete}
                sx={{
                  backgroundColor: '#F59E0B',
                  '&:hover': {
                    backgroundColor: '#FBBF24'
                  }
                }}>
                완료
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default CreateProjectSteps
