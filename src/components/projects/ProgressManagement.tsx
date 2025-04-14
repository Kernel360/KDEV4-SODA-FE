import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Search,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Stage } from '../../types/project'
import { client } from '../../api/client'
import EditStageModal from './EditStageModal'
import AddStageModal from './AddStageModal'

interface ProgressManagementProps {
  projectId: number
  stages: Stage[]
  onStagesChange: (stages: Stage[]) => void
}

const ProgressManagement: React.FC<ProgressManagementProps> = ({
  projectId,
  stages,
  onStagesChange
}) => {
  const [progressRequests, setProgressRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null)
  const [addPosition, setAddPosition] = useState<number | null>(null)

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        if (!stages || stages.length === 0) return
        const allRequests = await Promise.all(
          stages.map(async stage => {
            if (!stage.tasks) return []
            const stageRequests = await Promise.all(
              stage.tasks.map(async task => {
                const response = await client.get(`/tasks/${task.id}/requests`)
                return response.data.map((request: any) => ({
                  ...request,
                  stage: stage.name
                }))
              })
            )
            return stageRequests.flat()
          })
        )
        setProgressRequests(allRequests.flat())
      } catch (error) {
        console.error('Failed to fetch requests:', error)
      }
    }

    fetchAllRequests()
  }, [stages])

  const handleEditClick = (stage: Stage) => {
    setSelectedStage(stage)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (name: string) => {
    if (!selectedStage) return
    try {
      await client.put(`/stages/${selectedStage.id}`, { name })
      const updatedStages = stages.map(stage =>
        stage.id === selectedStage.id ? { ...stage, name } : stage
      )
      onStagesChange(updatedStages)
      setEditModalOpen(false)
      setSelectedStage(null)
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleDeleteClick = (stage: Stage) => {
    setStageToDelete(stage)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!stageToDelete) return
    try {
      await client.delete(`/stages/${stageToDelete.id}`)
      const updatedStages = stages.filter(
        stage => stage.id !== stageToDelete.id
      )
      onStagesChange(updatedStages)
      setDeleteModalOpen(false)
      setStageToDelete(null)
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setStageToDelete(null)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !stages) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onStagesChange(items)
  }

  const handleAddClick = (position: number) => {
    setAddPosition(position)
    setAddModalOpen(true)
  }

  const handleAddSubmit = async (name: string) => {
    if (addPosition === null || !stages) return
    try {
      const response = await client.post('/stages', {
        projectId,
        name,
        order: addPosition
      })
      const newStage = response.data
      const newStages = [...stages]
      newStages.splice(addPosition, 0, newStage)
      onStagesChange(newStages)
      setAddModalOpen(false)
      setAddPosition(null)
    } catch (error) {
      console.error('Failed to add stage:', error)
    }
  }

  const filteredRequests = progressRequests.filter(request =>
    searchTerm
      ? request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  )

  if (!stages) return null

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 'bold' }}>
        진행 단계
      </Typography>
      <Box
        sx={{
          mb: 4,
          mt: 2,
          width: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '3px'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }
        }}>
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
                  minWidth: 'min-content',
                  px: 1,
                  py: 1
                }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 50,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover .add-button': {
                      opacity: 1
                    }
                  }}>
                  <IconButton
                    className="add-button"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 184, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleAddClick(0)}>
                    <AddIcon sx={{ color: '#FFB800', fontSize: '1.2rem' }} />
                  </IconButton>
                </Box>
                {stages.map((stage, index) => {
                  const stageRequests = progressRequests.filter(
                    request => request.stage === stage.name
                  )
                  return (
                    <React.Fragment key={stage.id}>
                      <Draggable
                        draggableId={`stage-${stage.id}`}
                        index={index}>
                        {provided => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              p: 2,
                              width: 150,
                              cursor: 'pointer',
                              bgcolor: 'white',
                              color: '#666',
                              border: '1px solid',
                              borderColor: '#E0E0E0',
                              boxShadow: 'none',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#FFB800',
                                '& .stage-actions': {
                                  opacity: 1
                                }
                              }
                            }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1
                              }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  color: '#666'
                                }}>
                                {stage.name}
                              </Typography>
                              <Box
                                className="stage-actions"
                                sx={{
                                  display: 'flex',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  '& > button': {
                                    padding: '2px',
                                    minWidth: 'unset',
                                    color: '#666',
                                    '&:hover': {
                                      color: '#FFB800'
                                    }
                                  }
                                }}>
                                <IconButton
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleEditClick(stage)
                                  }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteClick(stage)
                                  }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#666'
                              }}>
                              {stageRequests.length}건
                            </Typography>
                          </Paper>
                        )}
                      </Draggable>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 50,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover .add-button': {
                            opacity: 1
                          }
                        }}>
                        <IconButton
                          className="add-button"
                          sx={{
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            padding: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 184, 0, 0.1)'
                            }
                          }}
                          onClick={() => handleAddClick(index + 1)}>
                          <AddIcon
                            sx={{ color: '#FFB800', fontSize: '1.2rem' }}
                          />
                        </IconButton>
                      </Box>
                    </React.Fragment>
                  )
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold' }}>
          요청 관리
        </Typography>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{
            width: 250,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E0E0E0'
              },
              '&:hover fieldset': {
                borderColor: '#FFB800'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFB800'
              }
            }
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: 'none', border: '1px solid #E0E0E0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell
                align="center"
                sx={{ width: '8%' }}>
                번호
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '12%' }}>
                단계
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '35%' }}>
                제목
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '12%' }}>
                작성자
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '12%' }}>
                등록일
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '12%' }}>
                승인/반려자
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '12%' }}>
                승인/반려일
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request, index) => (
              <TableRow
                key={request.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    cursor: 'pointer'
                  }
                }}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{request.stage}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell align="center">{request.author}</TableCell>
                <TableCell align="center">
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">{request.approver || '-'}</TableCell>
                <TableCell align="center">
                  {request.approvedAt
                    ? new Date(request.approvedAt).toLocaleDateString()
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditStageModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedStage(null)
        }}
        onSubmit={handleEditSubmit}
        initialName={selectedStage?.name || ''}
      />

      <AddStageModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setAddPosition(null)
        }}
        onSubmit={handleAddSubmit}
      />

      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title">
        <DialogTitle id="delete-dialog-title">단계 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말 "{stageToDelete?.name}" 단계를 삭제하시겠습니까?
            <br />
            삭제된 단계는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{
              color: '#666',
              '&:hover': {
                color: '#FFB800'
              }
            }}>
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              bgcolor: '#FFB800',
              '&:hover': {
                bgcolor: '#FFB800',
                opacity: 0.9
              }
            }}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProgressManagement
