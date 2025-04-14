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
  IconButton
} from '@mui/material'
import {
  Search,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { Stage } from '../../types/project'
import { client } from '../../api/client'
import EditStageModal from './EditStageModal'

interface ProgressManagementProps {
  projectId: number
  stages: Stage[]
}

const ProgressManagement: React.FC<ProgressManagementProps> = ({
  projectId,
  stages
}) => {
  const navigate = useNavigate()
  const [progressRequests, setProgressRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const allRequests = await Promise.all(
          stages.map(async stage => {
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
      // TODO: Refresh stages after edit
      setEditModalOpen(false)
      setSelectedStage(null)
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleDeleteClick = async (stageId: number) => {
    try {
      await client.delete(`/stages/${stageId}`)
      // TODO: Refresh stages after delete
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const filteredRequests = progressRequests.filter(request =>
    searchTerm
      ? request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  )

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 'bold' }}>
        진행 단계
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {stages.map(stage => (
          <Paper
            key={stage.id}
            sx={{
              p: 2,
              minWidth: 200,
              border: '1px solid #E0E0E0',
              boxShadow: 'none'
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
              <Typography
                variant="h6"
                sx={{ color: '#FFB800' }}>
                {stage.name}
              </Typography>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(stage)}
                  sx={{ color: '#FFB800' }}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(stage.id)}
                  sx={{ color: '#FFB800' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
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
          결제 관리
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
    </Box>
  )
}

export default ProgressManagement
