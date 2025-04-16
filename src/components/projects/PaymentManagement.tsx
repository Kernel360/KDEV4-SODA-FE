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
  Typography,
  Pagination
} from '@mui/material'
import { Search, Add } from '@mui/icons-material'
import { client } from '../../api/client'
import dayjs from 'dayjs'

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

interface Stage {
  id: number;
  name: string;
}

interface PaymentManagementProps {
  projectId: number;
  stages: Stage[];
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ projectId, stages }) => {
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [requests, setRequests] = useState<Request[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRequests, setTotalRequests] = useState(0)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams({
        status: 'PENDING',
        page: page.toString(),
        size: '5'
      });
      
      if (selectedStage) {
        queryParams.append('stageId', selectedStage.toString());
      }

      const response = await client.get(`/projects/${projectId}/requests?${queryParams.toString()}`);
      
      if (response.data.status === 'success' && response.data.data) {
        setRequests(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } else {
        setError('요청 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setError('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalRequests = async () => {
    try {
      const response = await client.get(`/projects/${projectId}/requests?status=PENDING&size=1`);
      if (response.data.status === 'success' && response.data.data) {
        setTotalRequests(response.data.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch total requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [projectId, selectedStage, page]);

  useEffect(() => {
    fetchTotalRequests();
  }, [projectId]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

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
              {totalRequests}건
            </Typography>
          </Paper>
          {stages.map(stage => {
            const stageRequests = requests.filter(
              request => request.stageId === stage.id
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
          sx={{ flex: 1 }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/user/projects/${projectId}/requests/create`)}
          sx={{
            bgcolor: '#FFB800',
            '&:hover': {
              bgcolor: '#FFB800',
              opacity: 0.8
            }
          }}>
          새로운 요청 추가
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E0E0E0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell>제목</TableCell>
              <TableCell>작성자</TableCell>
              <TableCell>단계</TableCell>
              <TableCell>작성일</TableCell>
              <TableCell>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">로딩 중...</TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">승인 대기 중인 요청이 없습니다.</TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow 
                  key={request.requestId}
                  hover
                  onClick={() => navigate(`/user/projects/${projectId}/requests/${request.requestId}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.memberName}</TableCell>
                  <TableCell>
                    {stages.find(stage => stage.id === request.stageId)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell>승인 대기중</TableCell>
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
    </Box>
  )
}

export default PaymentManagement
