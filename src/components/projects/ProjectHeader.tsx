import React, { useState } from 'react'
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
  List,
  ListItem,
  Paper,
  Stack,
  Divider
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { Project, ProjectStatus, Stage } from '../../types/project'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

interface ProjectHeaderProps {
  project: Project
  onStatusChange: (status: ProjectStatus) => Promise<void>
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onStatusChange
}) => {
  const navigate = useNavigate()
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
    endDate: dayjs(project.endDate),
    clientCompanyNames: project.clientCompanyNames,
    devCompanyNames: project.devCompanyNames
  })
  const [stages, setStages] = useState<Stage[]>(project.stages || [])
  const [newStage, setNewStage] = useState('')

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)
      await onStatusChange(selectedStatus)
      setStatusModalOpen(false)
    } catch (error) {
      console.error('Status update failed:', error)
    } finally {
      setIsUpdating(false)
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

  const handleStageReorder = (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStages(items)
  }

  const handleAddStage = () => {
    if (!newStage.trim()) return
    setStages(prev => [
      ...prev,
      {
        id: Math.max(...stages.map(s => s.id), 0) + 1,
        name: newStage,
        stageOrder: stages.length
      }
    ])
    setNewStage('')
  }

  const handleDeleteStage = (stageId: number) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId))
  }

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true)
      // TODO: API 호출로 프로젝트 정보 업데이트
      handleEditModalClose()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setIsUpdating(false)
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={getStatusText(project.status)}
              onClick={() => setStatusModalOpen(true)}
              sx={{
                bgcolor:
                  statusColors[project.status] || statusColors.IN_PROGRESS,
                color: 'white',
                '&:hover': {
                  bgcolor:
                    statusColors[project.status] || statusColors.IN_PROGRESS,
                  opacity: 0.9
                }
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}>
              클릭하면 프로젝트 상태를 바꿀 수 있습니다
            </Typography>
          </Box>
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
        fullWidth>
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
        <DialogContent>
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
            index={0}>
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
              <TextField
                fullWidth
                label="고객사"
                value={editFormData.clientCompanyNames.join(', ')}
                onChange={e =>
                  handleFormChange(
                    'clientCompanyNames',
                    e.target.value.split(',').map(s => s.trim())
                  )
                }
                helperText="쉼표(,)로 구분하여 입력"
              />
              <TextField
                fullWidth
                label="개발사"
                value={editFormData.devCompanyNames.join(', ')}
                onChange={e =>
                  handleFormChange(
                    'devCompanyNames',
                    e.target.value.split(',').map(s => s.trim())
                  )
                }
                helperText="쉼표(,)로 구분하여 입력"
              />
            </Stack>
          </TabPanel>

          {/* Stages Tab */}
          <TabPanel
            value={editTabValue}
            index={1}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="새 단계"
                  value={newStage}
                  onChange={e => setNewStage(e.target.value)}
                  placeholder="새로운 단계 이름을 입력하세요"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddStage}>
                  추가
                </Button>
              </Box>
              <Paper
                variant="outlined"
                sx={{ p: 2 }}>
                <DragDropContext onDragEnd={handleStageReorder}>
                  <Droppable droppableId="stages">
                    {provided => (
                      <List
                        {...provided.droppableProps}
                        ref={provided.innerRef}>
                        {stages.map((stage, index) => (
                          <Draggable
                            key={stage.id}
                            draggableId={String(stage.id)}
                            index={index}>
                            {provided => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  bgcolor: 'background.paper',
                                  '&:not(:last-child)': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                  }
                                }}>
                                <Box {...provided.dragHandleProps}>
                                  <DragIcon />
                                </Box>
                                <TextField
                                  fullWidth
                                  value={stage.name}
                                  onChange={e => {
                                    const newStages = [...stages]
                                    newStages[index].name = e.target.value
                                    setStages(newStages)
                                  }}
                                />
                                <IconButton
                                  onClick={() => handleDeleteStage(stage.id)}
                                  color="error">
                                  <DeleteIcon />
                                </IconButton>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              </Paper>
            </Stack>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isUpdating}>
            {isUpdating ? '저장 중...' : '저장'}
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
              onChange={e =>
                setSelectedStatus(e.target.value as ProjectStatus)
              }>
              <MenuItem value="CONTRACT">계약</MenuItem>
              <MenuItem value="IN_PROGRESS">진행중</MenuItem>
              <MenuItem value="DELIVERED">납품완료</MenuItem>
              <MenuItem value="MAINTENANCE">하자보수</MenuItem>
              <MenuItem value="ON_HOLD">일시중단</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setStatusModalOpen(false)}>취소</Button>
            <Button
              variant="contained"
              onClick={handleStatusChange}
              disabled={isUpdating}>
              {isUpdating ? '변경 중...' : '변경'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default ProjectHeader
