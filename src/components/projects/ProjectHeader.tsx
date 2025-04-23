import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Modal,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Paper,
  Stack,
  SelectChangeEvent
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type {
  Project,
  ProjectStatus,
  Stage,
  StageStatus
} from '../../types/project'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import StageCard from './StageCard'
import dayjs from 'dayjs'
import {
  updateStage,
  deleteStage,
  createStage,
  moveStage
} from '../../services/stageService'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'

interface ProjectHeaderProps {
  project: Project
  onStatusChange: (status: ProjectStatus) => Promise<void>
  stages: Stage[]
  onStageEdit: (stageId: number, newTitle: string) => Promise<void>
  onStageDelete: (stageId: number) => Promise<void>
  onTaskEdit: (taskId: number, title: string, content: string) => Promise<void>
  onStagesChange: (stages: Stage[]) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-edit-tabpanel-${index}`}
      aria-labelledby={`project-edit-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ pt: 3, px: 3, pb: 1 }}>{children}</Box>}
    </div>
  )
}

const getStatusText = (status: ProjectStatus): string => {
  switch (status) {
    case 'CONTRACT':
      return '계약'
    case 'IN_PROGRESS':
      return '진행중'
    case 'DELIVERED':
      return '납품완료'
    case 'MAINTENANCE':
      return '하자보수'
    case 'ON_HOLD':
      return '일시중단'
    default:
      return '진행중'
  }
}

const getStatusValue = (text: string): ProjectStatus => {
  switch (text) {
    case '계약':
      return 'CONTRACT'
    case '진행중':
      return 'IN_PROGRESS'
    case '납품완료':
      return 'DELIVERED'
    case '하자보수':
      return 'MAINTENANCE'
    case '일시중단':
      return 'ON_HOLD'
    default:
      return 'IN_PROGRESS'
  }
}

const MAX_STAGES = 10

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onStatusChange,
  stages,
  onStageEdit,
  onStageDelete,
  onTaskEdit,
  onStagesChange
}) => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  )
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(
    project.status || 'IN_PROGRESS'
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [editTabValue, setEditTabValue] = useState(0)
  const [editFormData, setEditFormData] = useState({
    title: project.title,
    description: project.description,
    startDate: dayjs(project.startDate),
    endDate: dayjs(project.endDate)
  })
  const [newStage, setNewStage] = useState('')
  const [stageMenuAnchorEl, setStageMenuAnchorEl] = useState<{
    [key: number]: HTMLElement | null
  }>({})
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [editingStage, setEditingStage] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingStageId, setDeletingStageId] = useState<number | null>(null)
  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newStageNameError, setNewStageNameError] = useState('')
  const [addingStageIndex, setAddingStageIndex] = useState<number | null>(null)

  useEffect(() => {
    if (deletingStageId !== null && !isDeleting) {
      const updatedStages = stages.filter(stage => stage.id !== deletingStageId)
      onStagesChange(updatedStages)
      setDeletingStageId(null)
    }
  }, [isDeleting, deletingStageId, stages, onStagesChange])

  const handleStatusSelect = async (
    event: SelectChangeEvent<ProjectStatus>
  ) => {
    const newStatus = event.target.value as ProjectStatus
    try {
      await onStatusChange(newStatus)
    } catch (error) {
      console.error('Failed to update project status:', error)
    }
  }

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null)
  }

  const handleEditModalOpen = () => {
    handleSettingsClose()
    setEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setEditModalOpen(false)
    setEditTabValue(0)
  }

  const handleEditTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setEditTabValue(newValue)
  }

  const handleFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 먼저 UI에 반영
    onStagesChange(items)

    try {
      const prevStage =
        result.destination.index > 0
          ? items[result.destination.index - 1]
          : null
      const nextStage =
        result.destination.index < items.length - 1
          ? items[result.destination.index + 1]
          : null

      await moveStage(reorderedItem.id, {
        prevStageId: prevStage?.id || null,
        nextStageId: nextStage?.id || null
      })
    } catch (error) {
      console.error('Failed to move stage:', error)
      // 실패 시 원래 순서로 되돌림
      onStagesChange(stages)
    }
  }

  const handleAddStageClick = (index: number) => {
    setAddingStageIndex(index)
    setIsAddingStage(true)
  }

  const handleAddStage = async () => {
    if (addingStageIndex === null || !newStageName.trim()) return

    if (stages.length >= MAX_STAGES) {
      alert('단계는 최대 10개까지만 생성할 수 있습니다.')
      return
    }

    // 중복 이름 체크
    if (stages.some(stage => stage.name === newStageName.trim())) {
      setNewStageNameError('이미 존재하는 단계 이름입니다.')
      return
    }

    setNewStageNameError('') // 에러 메시지 초기화

    let tempId: number
    try {
      const prevStage =
        addingStageIndex > 0 ? stages[addingStageIndex - 1] : null
      const nextStage =
        addingStageIndex < stages.length ? stages[addingStageIndex] : null

      // 사용자가 입력한 값으로 즉시 UI에 반영
      tempId = Date.now()
      console.log('임시 ID 생성:', tempId)
      const tempStage = {
        id: tempId,
        name: newStageName.trim(),
        title: newStageName.trim(),
        order: addingStageIndex,
        stageOrder: addingStageIndex,
        status: '대기' as StageStatus,
        tasks: []
      }
      console.log('임시 스테이지 생성:', tempStage)

      // 즉시 UI에 반영
      const updatedStages = [...stages]
      updatedStages.splice(addingStageIndex, 0, tempStage)
      console.log('UI에 임시 스테이지 추가 후:', updatedStages)
      onStagesChange(updatedStages)

      // API 호출
      console.log('API 호출 시작')
      const response = await createStage({
        projectId: project.id,
        name: newStageName.trim(),
        prevStageId: prevStage?.id || null,
        nextStageId: nextStage?.id || null
      })
      console.log('API 응답:', response)

      // API 성공 시 ID만 업데이트
      const finalStages = [...updatedStages]
      const tempStageIndex = finalStages.findIndex(stage => stage.id === tempId)
      if (tempStageIndex !== -1) {
        finalStages[tempStageIndex] = {
          ...finalStages[tempStageIndex],
          id: response.data.id,
          stageOrder: response.data.stageOrder
        }
        onStagesChange(finalStages)
      }

      setIsAddingStage(false)
      setAddingStageIndex(null)
      setNewStageName('')
    } catch (error) {
      console.error('Failed to create stage:', error)
      alert('단계 생성에 실패했습니다.')
      // 실패 시 임시 스테이지 제거
      const updatedStages = stages.filter(stage => stage.id !== tempId)
      console.log('실패 시 임시 스테이지 제거 후:', updatedStages)
      onStagesChange(updatedStages)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true)
      await projectService.updateProject(project.id, {
        title: editFormData.title,
        description: editFormData.description,
        startDate: editFormData.startDate.toISOString(),
        endDate: editFormData.endDate.toISOString()
      })
      handleEditModalClose()
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('프로젝트 정보 수정에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStageMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    stageId: number
  ) => {
    setStageMenuAnchorEl(prev => ({ ...prev, [stageId]: event.currentTarget }))
    setSelectedStageId(stageId)
  }

  const handleStageMenuClose = (stageId: number) => {
    setStageMenuAnchorEl(prev => ({ ...prev, [stageId]: null }))
    setSelectedStageId(null)
  }

  const handleStageEdit = (stage: Stage) => {
    setEditingStage({ id: stage.id, name: stage.name })
  }

  const handleStageEditSave = async () => {
    if (editingStage) {
      try {
        console.log('Updating stage:', editingStage.id, editingStage.name)
        const response = await updateStage(editingStage.id, editingStage.name)
        await onStageEdit(editingStage.id, editingStage.name)
        setEditingStage(null)
      } catch (error) {
        console.error('Failed to update stage:', error)
      }
    }
  }

  const handleStageDeleteClick = async (stageId: number) => {
    try {
      console.log('Deleting stage:', stageId)
      setIsDeleting(true)
      setDeletingStageId(stageId)
      await deleteStage(stageId)
      await onStageDelete(stageId)
    } catch (error) {
      console.error('Failed to delete stage:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const statusColors = {
    CONTRACT: '#64748B',
    IN_PROGRESS: '#2563EB',
    DELIVERED: '#059669',
    MAINTENANCE: '#9333EA',
    ON_HOLD: '#DC2626'
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3">{project.title}</Typography>
          <FormControl
            size="small"
            sx={{ minWidth: 120 }}>
            <Select
              value={project.status}
              onChange={handleStatusSelect}>
              <MenuItem value="CONTRACT">계약</MenuItem>
              <MenuItem value="IN_PROGRESS">진행중</MenuItem>
              <MenuItem value="DELIVERED">납품완료</MenuItem>
              <MenuItem value="MAINTENANCE">하자보수</MenuItem>
              <MenuItem value="ON_HOLD">일시중단</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <IconButton
          onClick={handleSettingsClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1
        }}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            고객사
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {project.clientCompanyNames.join(', ')}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            개발사
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {project.devCompanyNames.join(', ')}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            기간
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {new Date(project.startDate).toLocaleDateString()} ~{' '}
            {new Date(project.endDate).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsClose}>
        <MenuItem onClick={handleEditModalOpen}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>수정</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '550px',
            maxHeight: '550px'
          }
        }}>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <Typography variant="h6">프로젝트 수정</Typography>
            <IconButton
              onClick={handleEditModalClose}
              sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            height: '100%',
            pb: '8px !important'
          }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={editTabValue}
              onChange={handleEditTabChange}
              aria-label="project edit tabs">
              <Tab label="기본 정보" />
              <Tab label="단계 수정" />
            </Tabs>
          </Box>

          {/* Basic Info Tab */}
          <TabPanel
            value={editTabValue}
            index={0}
            sx={{
              height: 'calc(100% - 49px)',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: '#f5f5f5'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555'
                }
              }
            }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="프로젝트명"
                value={editFormData.title}
                onChange={e => handleFormChange('title', e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="프로젝트 설명"
                value={editFormData.description}
                onChange={e => handleFormChange('description', e.target.value)}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack
                  direction="row"
                  spacing={2}>
                  <DatePicker
                    label="시작일"
                    value={editFormData.startDate}
                    onChange={value => handleFormChange('startDate', value)}
                  />
                  <DatePicker
                    label="종료일"
                    value={editFormData.endDate}
                    onChange={value => handleFormChange('endDate', value)}
                  />
                </Stack>
              </LocalizationProvider>
            </Stack>
          </TabPanel>

          {/* Stages Tab */}
          <TabPanel
            value={editTabValue}
            index={1}
            sx={{
              height: 'calc(100% - 49px)',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: '#f5f5f5'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555'
                }
              }
            }}>
            <Box
              sx={{
                height: '100%'
              }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}>
                • 단계는 최대 10개까지만 생성할 수 있습니다.
                <br />• 드래그앤드롭으로 단계의 순서를 변경할 수 있습니다.
              </Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable
                  droppableId="stages"
                  direction="horizontal">
                  {provided => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        display: 'flex',
                        gap: 0,
                        overflowX: 'auto',
                        pt: 10,
                        pb: 15,
                        px: 2,
                        height: '100%',
                        '&::-webkit-scrollbar': {
                          height: '8px',
                          backgroundColor: '#f5f5f5'
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#888',
                          borderRadius: '4px',
                          '&:hover': {
                            background: '#555'
                          }
                        }
                      }}>
                      {/* Add button at the start */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 0.25,
                          height: 60,
                          opacity: 0,
                          transition: 'opacity 0.2s, padding 0.2s',
                          '&:hover': {
                            opacity: 1,
                            px: 0.5
                          }
                        }}>
                        <Button
                          onClick={() => handleAddStageClick(0)}
                          disabled={stages.length >= MAX_STAGES}
                          sx={{
                            minWidth: '30px',
                            width: '30px',
                            height: '30px',
                            p: 0,
                            borderRadius: '50%',
                            border: '2px dashed',
                            borderColor: 'divider'
                          }}>
                          <AddIcon fontSize="small" />
                        </Button>
                      </Box>
                      {stages.map((stage, index) => (
                        <React.Fragment key={stage.id}>
                          <Draggable
                            draggableId={String(stage.id)}
                            index={index}>
                            {provided => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  width: 200,
                                  minWidth: 200,
                                  height: 60,
                                  minHeight: 50,
                                  p: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  gap: 0.5,
                                  cursor: 'grab',
                                  '&:active': {
                                    cursor: 'grabbing'
                                  },
                                  '&:hover': {
                                    boxShadow: 3
                                  }
                                }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    height: '100%',
                                    width: '100%'
                                  }}>
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      flex: 1,
                                      cursor: 'grab',
                                      '&:active': {
                                        cursor: 'grabbing'
                                      }
                                    }}>
                                    <Typography
                                      sx={{
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: '1.1rem',
                                        fontWeight: 500,
                                        py: 0.5
                                      }}>
                                      {index + 1}. {stage.name}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleStageMenuOpen(e, stage.id)
                                    }}
                                    sx={{
                                      padding: 0.5
                                    }}>
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                  <Menu
                                    anchorEl={stageMenuAnchorEl[stage.id]}
                                    open={Boolean(stageMenuAnchorEl[stage.id])}
                                    onClose={() =>
                                      handleStageMenuClose(stage.id)
                                    }
                                    anchorOrigin={{
                                      vertical: 'bottom',
                                      horizontal: 'right'
                                    }}
                                    transformOrigin={{
                                      vertical: 'top',
                                      horizontal: 'right'
                                    }}>
                                    <MenuItem
                                      onClick={() => {
                                        handleStageMenuClose(stage.id)
                                        handleStageEdit(stage)
                                      }}>
                                      <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText>수정</ListItemText>
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleStageMenuClose(stage.id)
                                        handleStageDeleteClick(stage.id)
                                      }}>
                                      <ListItemIcon>
                                        <DeleteIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText>삭제</ListItemText>
                                    </MenuItem>
                                  </Menu>
                                </Box>
                              </Paper>
                            )}
                          </Draggable>
                          {/* Add button between stages */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              px: 0.25,
                              height: 60,
                              opacity: 0,
                              transition: 'opacity 0.2s, padding 0.2s',
                              '&:hover': {
                                opacity: 1,
                                px: 0.5
                              }
                            }}>
                            <Button
                              onClick={() => handleAddStageClick(index + 1)}
                              disabled={stages.length >= MAX_STAGES}
                              sx={{
                                minWidth: '30px',
                                width: '30px',
                                height: '30px',
                                p: 0,
                                borderRadius: '50%',
                                border: '2px dashed',
                                borderColor: 'divider'
                              }}>
                              <AddIcon fontSize="small" />
                            </Button>
                          </Box>
                        </React.Fragment>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
              {stages.length >= MAX_STAGES && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  단계는 최대 10개까지만 생성할 수 있습니다.
                </Typography>
              )}
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          {editTabValue === 0 && (
            <>
              <Button onClick={handleEditModalClose}>취소</Button>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                disabled={isUpdating}>
                {isUpdating ? '저장 중...' : '저장'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Stage Edit Dialog */}
      <Dialog
        open={editingStage !== null}
        onClose={() => setEditingStage(null)}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
        onBackdropClick={e => e.preventDefault()}>
        <DialogTitle>단계 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="단계 이름"
            value={editingStage?.name || ''}
            onChange={e =>
              setEditingStage(prev =>
                prev ? { ...prev, name: e.target.value } : null
              )
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingStage(null)}>취소</Button>
          <Button
            onClick={handleStageEditSave}
            variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Stage Dialog */}
      <Dialog
        open={isAddingStage}
        onClose={() => {
          setIsAddingStage(false)
          setNewStageNameError('') // 모달 닫을 때 에러 메시지 초기화
        }}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>새 단계 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="단계 이름"
            value={newStageName}
            onChange={e => {
              setNewStageName(e.target.value)
              setNewStageNameError('') // 입력 시 에러 메시지 초기화
            }}
            error={!!newStageNameError}
            helperText={newStageNameError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddingStage(false)
              setNewStageNameError('')
            }}>
            취소
          </Button>
          <Button
            onClick={handleAddStage}
            variant="contained"
            disabled={!newStageName.trim() || !!newStageNameError}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1
          }}>
          <Typography
            id="status-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}>
            프로젝트 상태 변경
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 3 }}>
            <InputLabel id="status-select-label">상태</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="상태"
              onChange={handleStatusSelect}>
              <MenuItem value="CONTRACT">계약</MenuItem>
              <MenuItem value="IN_PROGRESS">진행중</MenuItem>
              <MenuItem value="DELIVERED">납품완료</MenuItem>
              <MenuItem value="MAINTENANCE">하자보수</MenuItem>
              <MenuItem value="ON_HOLD">일시중단</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setStatusModalOpen(false)}>취소</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default ProjectHeader
