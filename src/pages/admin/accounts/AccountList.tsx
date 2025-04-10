import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Switch,
  Button,
  TextField,
  InputAdornment
} from '@mui/material'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import { MemberListDto } from '../../../types/api'
import { getUsers, updateUserStatus } from '../../../api/admin'
import DataTable from '../../../components/common/DataTable'

export default function AccountList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [accounts, setAccounts] = useState<MemberListDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, rowsPerPage, searchKeyword])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers(page, rowsPerPage, searchKeyword)
      if (response.status === 'success' && response.data) {
        setAccounts(response.data.content)
        setTotalCount(response.data.totalElements)
      } else {
        showToast('사용자 목록을 불러오는데 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('사용자 목록 조회 중 오류:', err)
      showToast('사용자 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      const response = await updateUserStatus(userId, !currentActive)
      if (response.status === 'success') {
        showToast('사용자 상태가 성공적으로 변경되었습니다.', 'success')
        fetchUsers() // 목록 새로고침
      } else {
        showToast(
          response.message || '사용자 상태 변경에 실패했습니다.',
          'error'
        )
      }
    } catch (err) {
      console.error('사용자 상태 변경 중 오류:', err)
      showToast('사용자 상태 변경에 실패했습니다.', 'error')
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value)
    setPage(0) // 검색어가 변경되면 첫 페이지로 이동
  }

  const handleRowClick = (row: MemberListDto) => {
    navigate(`/admin/accounts/${row.id}`)
  }

  const columns = [
    {
      id: 'name',
      label: '이름',
      render: (row: MemberListDto) => row.name
    },
    {
      id: 'authId',
      label: '아이디',
      render: (row: MemberListDto) => row.authId
    },
    {
      id: 'company',
      label: '회사',
      render: (row: MemberListDto) => row.company || '-'
    },
    {
      id: 'role',
      label: '권한',
      render: (row: MemberListDto) =>
        row.role === 'ADMIN' ? '관리자' : '일반 사용자'
    },
    {
      id: 'active',
      label: '활성화',
      render: (row: MemberListDto) => (
        <Switch
          checked={!row.deleted}
          onChange={() => handleToggleActive(row.id, !row.deleted)}
          color="primary"
          onClick={(e) => e.stopPropagation()}
        />
      )
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography
          variant="h5"
          component="h1">
          계정 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusCircle />}
          onClick={() => navigate('/admin/accounts/create')}
          sx={{
            bgcolor: 'black',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)'
            }
          }}>
          새 계정 생성
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="이름, 아이디, 회사로 검색"
          value={searchKeyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      <DataTable<MemberListDto>
        columns={columns}
        data={accounts}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        onRowClick={handleRowClick}
      />
    </Box>
  )
}
