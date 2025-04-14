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
  InputAdornment
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
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredRequests = paymentRequests.filter(request => {
    const matchesStage = selectedStage ? request.stage === selectedStage : true
    const matchesSearch = searchTerm
      ? request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    return matchesStage && matchesSearch
  })

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mb: 4,
          flexWrap: 'wrap'
        }}>
        <Button
          variant={selectedStage === null ? 'contained' : 'outlined'}
          onClick={() => setSelectedStage(null)}
          sx={{
            backgroundColor: selectedStage === null ? '#FFB800' : 'transparent',
            color: selectedStage === null ? 'white' : '#FFB800',
            borderColor: '#FFB800',
            '&:hover': {
              backgroundColor:
                selectedStage === null ? '#FFB800' : 'transparent',
              opacity: 0.8
            }
          }}>
          전체 {paymentRequests.length}건
        </Button>
        {stages.map(stage => (
          <Button
            key={stage.id}
            variant={selectedStage === stage.name ? 'contained' : 'outlined'}
            onClick={() => setSelectedStage(stage.name)}
            sx={{
              backgroundColor:
                selectedStage === stage.name ? '#FFB800' : 'transparent',
              color: selectedStage === stage.name ? 'white' : '#FFB800',
              borderColor: '#FFB800',
              '&:hover': {
                backgroundColor:
                  selectedStage === stage.name ? '#FFB800' : 'transparent',
                opacity: 0.8
              }
            }}>
            {stage.name}{' '}
            {paymentRequests.filter(r => r.stage === stage.name).length}건
          </Button>
        ))}
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
