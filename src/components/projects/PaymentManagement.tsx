import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material'
import { Search, Add } from '@mui/icons-material'
import { Stage } from '../../types/project'
import { client } from '../../api/client'

interface PaymentManagementProps {
  projectId: number
  stages: Stage[]
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  projectId,
  stages
}) => {
  const navigate = useNavigate()
  const [paymentRequests, setPaymentRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<number | null>(null)

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
        setPaymentRequests(allRequests.flat())
      } catch (error) {
        console.error('Failed to fetch requests:', error)
      }
    }

    fetchAllRequests()
  }, [stages])

  const filteredRequests = paymentRequests.filter(request =>
    searchTerm
      ? request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.author.toLowerCase().includes(searchTerm.toLowerCase())
      : selectedStage === null ||
        request.stage === stages.find(s => s.id === selectedStage)?.name
  )

  return (
    <Box sx={{ mb: 4 }}>
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
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            minWidth: 'min-content',
            px: 1,
            py: 1
          }}>
          <Paper
            onClick={() => setSelectedStage(null)}
            sx={{
              p: 2,
              width: 150,
              cursor: 'pointer',
              bgcolor: 'white',
              color: '#666',
              border: '1px solid',
              borderColor: selectedStage === null ? '#FFB800' : '#E0E0E0',
              boxShadow: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#FFB800'
              }
            }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                mb: 1,
                color: selectedStage === null ? '#FFB800' : '#666'
              }}>
              전체
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666'
              }}>
              {paymentRequests.length}건
            </Typography>
          </Paper>
          {stages.map(stage => {
            const stageRequests = paymentRequests.filter(
              request => request.stage === stage.name
            )
            return (
              <Paper
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                sx={{
                  p: 2,
                  width: 150,
                  cursor: 'pointer',
                  bgcolor: 'white',
                  color: '#666',
                  border: '1px solid',
                  borderColor:
                    selectedStage === stage.id ? '#FFB800' : '#E0E0E0',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#FFB800'
                  }
                }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    mb: 1,
                    color: selectedStage === stage.id ? '#FFB800' : '#666'
                  }}>
                  {stage.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666'
                  }}>
                  {stageRequests.length}건
                </Typography>
              </Paper>
            )
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            navigate(`/user/projects/${projectId}/requests/create`)
          }
          sx={{
            bgcolor: '#FFB800',
            '&:hover': {
              bgcolor: '#FFB800',
              opacity: 0.8
            }
          }}>
          새로운 요청 추가
        </Button>

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
                sx={{ width: '15%' }}>
                단계
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '47%' }}>
                제목
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '15%' }}>
                작성자
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '15%' }}>
                등록일
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default PaymentManagement
