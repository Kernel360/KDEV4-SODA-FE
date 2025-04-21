import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  Badge
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { projectService } from '../../services/projectService'
import { useToast } from '../../contexts/ToastContext'
import { StageStatus } from '../../types/project'

interface Stage {
  id: number
  name: string
  stageOrder: number
  status: StageStatus
  memberCount: number
}

const ProjectStageEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stages, setStages] = useState<Stage[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const [stageForm, setStageForm] = useState({
    name: ''
  })

  useEffect(() => {
    fetchStages()
  }, [id])

  const fetchStages = async () => {
    try {
      const projectStages = await projectService.getProjectStages(Number(id))
      const transformedStages = projectStages.map(stage => ({
        id: stage.id,
        name: stage.name,
        stageOrder: stage.stageOrder,
        status: '진행중' as StageStatus,
        memberCount: stage.tasks?.length || 0
      }))
      setStages(transformedStages)
    } catch (error) {
      showToast('단계 정보를 불러오는데 실패했습니다.', 'error')
    }
  }

  const handleOpenDialog = (mode: 'create' | 'edit', stage?: Stage) => {
    setEditMode(mode)
    if (mode === 'edit' && stage) {
      setSelectedStage(stage)
      setStageForm({
        name: stage.name
      })
    } else {
      setSelectedStage(null)
      setStageForm({
        name: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedStage(null)
    setStageForm({
      name: ''
    })
  }

  const handleSubmit = async () => {
    try {
      if (editMode === 'create') {
        await projectService.createProjectStage(Number(id), stageForm)
        showToast('새로운 단계가 추가되었습니다.', 'success')
      } else if (selectedStage) {
        await projectService.updateProjectStage(selectedStage.id, stageForm)
        showToast('단계가 수정되었습니다.', 'success')
      }
      handleCloseDialog()
      fetchStages()
    } catch (error) {
      showToast(
        `단계 ${editMode === 'create' ? '추가' : '수정'}에 실패했습니다.`,
        'error'
      )
    }
  }

  const handleDeleteStage = async (stageId: number) => {
    if (window.confirm('정말로 이 단계를 삭제하시겠습니까?')) {
      try {
        await projectService.deleteProjectStage(stageId)
        showToast('단계가 삭제되었습니다.', 'success')
        fetchStages()
      } catch (error) {
        showToast('단계 삭제에 실패했습니다.', 'error')
      }
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue)
  }

  const totalCount = stages.reduce((sum, stage) => sum + stage.memberCount, 0)

  return (
    <Box p={3}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        mb={4}>
        <IconButton onClick={() => navigate(`/user/projects/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">프로젝트 단계 관리</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}>
          단계 추가
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 3
                }
              }}>
              <Tab
                label={
                  <Box sx={{ position: 'relative', pr: 3 }}>
                    전체
                    <Badge
                      badgeContent={totalCount}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        right: -8,
                        top: -8,
                        '& .MuiBadge-badge': {
                          backgroundColor:
                            selectedTabIndex === 0 ? '#2563EB' : '#94A3B8',
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                }
                sx={{
                  color: selectedTabIndex === 0 ? '#2563EB' : 'text.primary',
                  '&.Mui-selected': {
                    color: '#2563EB',
                    fontWeight: 600
                  }
                }}
              />
              {stages.map((stage, index) => (
                <Tab
                  key={stage.id}
                  label={
                    <Box sx={{ position: 'relative', pr: 3 }}>
                      {stage.name}
                      <Badge
                        badgeContent={stage.memberCount}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          right: -8,
                          top: -8,
                          '& .MuiBadge-badge': {
                            backgroundColor:
                              selectedTabIndex === index + 1
                                ? '#2563EB'
                                : '#94A3B8',
                            color: 'white'
                          }
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    color:
                      selectedTabIndex === index + 1
                        ? '#2563EB'
                        : 'text.primary',
                    '&.Mui-selected': {
                      color: '#2563EB',
                      fontWeight: 600
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ mt: 3 }}>
            {selectedTabIndex === 0 ? (
              <Typography>전체 단계의 내용</Typography>
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography variant="h6">
                  {stages[selectedTabIndex - 1]?.name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleOpenDialog('edit', stages[selectedTabIndex - 1])
                    }>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleDeleteStage(stages[selectedTabIndex - 1].id)
                    }>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          {editMode === 'create' ? '단계 추가' : '단계 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 2 }}>
            <TextField
              label="단계명"
              fullWidth
              value={stageForm.name}
              onChange={e =>
                setStageForm(prev => ({ ...prev, name: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}>
            {editMode === 'create' ? '추가' : '수정'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectStageEdit
