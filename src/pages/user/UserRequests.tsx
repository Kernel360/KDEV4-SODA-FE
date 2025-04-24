import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  CircularProgress,
  TextField,
  InputAdornment,
  Button
} from '@mui/material'
import { client } from '../../api/client'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../contexts/ToastContext'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'

interface Request {
  requestId: number
  projectId: number
  title: string
  status: string
  createdAt: string
}

const UserRequests: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useUserStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')

  useEffect(() => {
    if (user?.memberId) {
      fetchRequests()
    }
  }, [user?.memberId, page, activeSearchTerm])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await client.get(`/members/${user.memberId}/requests`, {
        params: {
          page: page - 1,
          size: 10,
          keyword: activeSearchTerm.trim() || undefined
        }
      })
      if (response.data.status === 'success') {
        setRequests(response.data.data.content)
        setTotalPages(response.data.data.page.totalPages)
      }
    } catch (error) {
      console.error('요청사항 목록 조회 중 오류:', error)
      showToast('요청사항 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    setActiveSearchTerm(searchTerm)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인'
      case 'REJECTED':
        return '거절'
      case 'PENDING':
        return '대기'
      case 'APPROVING':
        return '승인중'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: '#16a34a',
          backgroundColor: '#dcfce7'
        }
      case 'REJECTED':
        return {
          color: '#dc2626',
          backgroundColor: '#fee2e2'
        }
      case 'PENDING':
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
      default:
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
    }
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        요청사항 목록
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
        >
          검색
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>생성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.requestId}
                hover
                onClick={() => navigate(`/user/projects/${request.projectId}/requests/${request.requestId}`)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{request.title}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(request.status)}
                    sx={getStatusColor(request.status)}
                  />
                </TableCell>
                <TableCell>
                  {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={3}>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        )}
      </Box>
    </Box>
  )
}

export default UserRequests 