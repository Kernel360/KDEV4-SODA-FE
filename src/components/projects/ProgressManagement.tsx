import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  DialogActions,
  Pagination,
  Chip
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
import dayjs from 'dayjs'

interface ProgressManagementProps {
  projectId: number
  stages: Stage[]
  onStagesChange: (stages: Stage[]) => void
}

interface Request {
  requestId: number;
  stageId: number;
  memberId: number;
  memberName: string;
  title: string;
  content: string;
  links: {
    id: number;
    urlAddress: string;
    urlDescription: string;
  }[];
  files: any[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ProgressManagement: React.FC<ProgressManagementProps> = ({
  projectId,
  stages,
  onStagesChange
}) => {
  const navigate = useNavigate()
  console.log('Progress Management Stages:', stages);

  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null)
  const [addPosition, setAddPosition] = useState<number | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stageRequests, setStageRequests] = useState<{ [key: number]: number }>({})

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // 페이지네이션된 요청 데이터 가져오기
      const pageQueryParams = new URLSearchParams();
      pageQueryParams.append('status', 'APPROVED');
      pageQueryParams.append('status', 'REJECTED');
      pageQueryParams.append('page', page.toString());
      pageQueryParams.append('size', '5');
      
      if (selectedStageId) {
        pageQueryParams.append('stageId', selectedStageId.toString());
      }

      // 전체 요청 데이터 가져오기 (단계별 카운트용)
      const countQueryParams = new URLSearchParams();
      countQueryParams.append('status', 'APPROVED');
      countQueryParams.append('status', 'REJECTED');
      countQueryParams.append('size', '100');

      const [pageResponse, countResponse] = await Promise.all([
        client.get(`/projects/${projectId}/requests?${pageQueryParams.toString()}`),
        !selectedStageId ? client.get(`/projects/${projectId}/requests?${countQueryParams.toString()}`) : null
      ].filter(Boolean));
      
      if (pageResponse && pageResponse.data.status === 'success' && pageResponse.data.data) {
        setRequests(pageResponse.data.data.content);
        setTotalPages(pageResponse.data.data.totalPages);
      }

      // 단계별 카운트는 전체 보기일 때만 업데이트
      if (!selectedStageId && countResponse?.data.status === 'success' && countResponse?.data.data) {
        const counts: { [key: number]: number } = {};
        countResponse.data.data.content.forEach((request: Request) => {
          counts[request.stageId] = (counts[request.stageId] || 0) + 1;
        });
        setStageRequests(counts);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [projectId, selectedStageId, page]);

  const handleEditClick = (stage: Stage) => {
    setSelectedStageId(stage.id)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (name: string) => {
    if (!selectedStageId) return
    try {
      await client.put(`/stages/${selectedStageId}`, { name })
      const updatedStages = stages.map(stage =>
        stage.id === selectedStageId ? { ...stage, name } : stage
      )
      onStagesChange(updatedStages)
      setEditModalOpen(false)
      setSelectedStageId(null)
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

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: '#16a34a',
          backgroundColor: '#dcfce7'
        };
      case 'REJECTED':
        return {
          color: '#dc2626',
          backgroundColor: '#fee2e2'
        };
      default:
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '거절';
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter(request =>
    searchTerm
      ? request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.memberName.toLowerCase().includes(searchTerm.toLowerCase())
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
                {stages.map((stage, index) => (
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
                            {stageRequests[stage.id] || 0}건
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
                ))}
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
                상태
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">로딩 중...</TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">처리된 요청이 없습니다.</TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request, index) => (
                <TableRow 
                  key={request.requestId}
                  hover
                  onClick={() => navigate(`/user/projects/${projectId}/requests/${request.requestId}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell align="center">{(page * 5) + index + 1}</TableCell>
                  <TableCell align="center">
                    {stages.find(stage => stage.id === request.stageId)?.name || '삭제된 단계'}
                  </TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell align="center">{request.memberName}</TableCell>
                  <TableCell align="center">
                    {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={getStatusText(request.status)}
                      sx={{
                        ...getStatusColor(request.status),
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <EditStageModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedStageId(null)
        }}
        onSubmit={handleEditSubmit}
        initialName={stages.find(stage => stage.id === selectedStageId)?.name || ''}
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
